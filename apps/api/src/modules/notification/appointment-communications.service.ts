import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  GoogleCalendarGateway,
  calendarEventId,
} from './providers/google-calendar';
import { WhatsAppGateway, normalizedPhone } from './providers/whatsapp';
import { ProviderError } from './providers/provider-error';
import { createHash, randomUUID } from 'node:crypto';
type CommunicationAppointment = Prisma.AppointmentGetPayload<{
  include: {
    slot: true;
    communication: true;
    reminderConsent: true;
    order: {
      include: {
        paymentTransactions: true;
        customer: { include: { contact: true } };
      };
    };
  };
}>;
type CommunicationJob = {
  id: string;
  eventCode: string;
  payload: Prisma.JsonValue;
  attempts: number;
};
export const slotRevision = (slot: {
  id: string;
  startsAt: Date;
  endsAt: Date;
}) =>
  createHash('sha256')
    .update(
      `${slot.id}:${slot.startsAt.toISOString()}:${slot.endsAt.toISOString()}`,
    )
    .digest('hex');
@Injectable()
export class AppointmentCommunicationsService
  implements OnModuleInit, OnModuleDestroy
{
  private timer?: ReturnType<typeof setInterval>;
  private running = false;
  constructor(
    private readonly db: PrismaService,
    private readonly config: ConfigService,
    private readonly google: GoogleCalendarGateway,
    private readonly whatsapp: WhatsAppGateway,
  ) {}
  onModuleInit() {
    if (!['scheduled', 'poll'].includes(this.runner()))
      throw new Error('OUTBOX_RUNNER must be scheduled or poll');
    if (this.runner() === 'poll' && this.config.get<string>('K_SERVICE'))
      throw new Error('Use OUTBOX_RUNNER=scheduled on Cloud Run');
    if (this.enabled() && this.runner() === 'poll')
      this.timer = setInterval(
        () => void this.processDue().catch(() => undefined),
        15000,
      );
  }
  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }
  enabled() {
    return this.config.get<string>('COMMUNICATIONS_ENABLED') === 'true';
  }
  runner() {
    return this.config.get<string>('OUTBOX_RUNNER') || 'scheduled';
  }
  readiness() {
    return {
      enabled: this.enabled(),
      runner: this.runner(),
      googleConfigured: this.google.configured(),
      whatsappConfigured: this.whatsapp.configured(),
      reminderMinutes: this.leads(),
    };
  }
  private leads() {
    return [
      ...new Set(
        (this.config.get<string>('CONSULTATION_REMINDER_MINUTES') || '1440,60')
          .split(',')
          .map(Number)
          .filter((n) => Number.isInteger(n) && n > 0 && n <= 10080),
      ),
    ];
  }
  // Called only by a trusted domain transaction after payment/webhook/agenda decisions.
  async enqueueCalendar(
    tx: Prisma.TransactionClient,
    appointmentId: string,
    reconcile = false,
  ) {
    const appointment = await tx.appointment.findUnique({
      where: { id: appointmentId },
      include: { slot: true },
    });
    if (!appointment) throw new Error('APPOINTMENT_NOT_FOUND');
    const revision = slotRevision(appointment.slot);
    const key = `calendar:${appointment.id}:${revision}:${appointment.status}${reconcile ? ':reconcile:' + randomUUID() : ''}`;
    await tx.outboxMessage.upsert({
      where: { deduplicationKey: key },
      create: {
        eventCode: 'APPOINTMENT_CALENDAR_SYNC',
        payload: { appointmentId, revision },
        deduplicationKey: key,
      },
      update: {},
    });
  }
  private async snapshot(id: string) {
    return this.db.appointment.findUnique({
      where: { id },
      include: {
        slot: true,
        communication: true,
        reminderConsent: true,
        order: {
          include: {
            paymentTransactions: true,
            customer: { include: { contact: true } },
          },
        },
      },
    });
  }
  private async run(eventCode: string, payload: Prisma.JsonValue) {
    if (
      !payload ||
      typeof payload !== 'object' ||
      Array.isArray(payload) ||
      typeof payload.appointmentId !== 'string'
    )
      throw new ProviderError('INVALID_JOB');
    const appointment = await this.snapshot(payload.appointmentId);
    if (!appointment) return 'SKIPPED';
    const revision = slotRevision(appointment.slot);
    if (eventCode === 'APPOINTMENT_CALENDAR_SYNC')
      return this.syncCalendar(appointment, payload, revision);
    if (eventCode === 'APPOINTMENT_WHATSAPP_REMINDER')
      return this.sendReminder(appointment, payload, revision);
    throw new ProviderError('UNKNOWN_JOB');
  }
  private async cancelCalendar(
    appointment: CommunicationAppointment,
    revision: string,
  ) {
    if (appointment.communication)
      await this.google.cancel(
        appointment.communication.calendarId,
        appointment.communication.eventId,
      );
    await this.db.$transaction([
      this.db.outboxMessage.updateMany({
        where: {
          eventCode: 'APPOINTMENT_WHATSAPP_REMINDER',
          payload: { path: ['appointmentId'], equals: appointment.id },
          status: { in: ['PENDING', 'RETRY'] },
        },
        data: { status: 'SKIPPED' },
      }),
      this.db.appointmentCommunication.updateMany({
        where: { appointmentId: appointment.id },
        data: { calendarUrl: null, meetUrl: null, syncedRevision: revision },
      }),
    ]);
    return 'PROCESSED' as const;
  }
  private async syncCalendar(
    appointment: CommunicationAppointment,
    payload: Prisma.JsonObject,
    revision: string,
  ) {
    if (
      appointment.status === 'CANCELED' ||
      appointment.order.status === 'CANCELED'
    )
      return this.cancelCalendar(appointment, revision);
    if (
      payload.revision !== revision ||
      appointment.status !== 'BOOKED' ||
      !['CONFIRMED', 'CANCELLATION_REQUESTED'].includes(
        appointment.order.status,
      ) ||
      !appointment.order.paymentTransactions.some(
        (payment) => payment.status === 'APPROVED' && payment.confirmedAt,
      ) ||
      appointment.slot.startsAt <= new Date()
    )
      return 'SKIPPED';
    const contact = appointment.order.customer.contact;
    if (!contact?.email) throw new ProviderError('CUSTOMER_EMAIL_MISSING');
    const calendar =
      appointment.communication?.calendarId || this.google.calendarId();
    if (!calendar) throw new ProviderError('GOOGLE_NOT_CONFIGURED');
    // Persist the stable external ID before the remote side effect so cancellation can reconcile after a crash.
    await this.db.appointmentCommunication.upsert({
      where: { appointmentId: appointment.id },
      create: {
        appointmentId: appointment.id,
        calendarId: calendar,
        eventId: calendarEventId(appointment.id),
      },
      update: {},
    });
    const result = await this.google.upsert(
      {
        reference: appointment.id,
        startsAt: appointment.slot.startsAt,
        endsAt: appointment.slot.endsAt,
        customerEmail: contact.email,
      },
      calendar,
    );
    const latest = await this.snapshot(appointment.id);
    if (!latest) {
      await this.google.cancel(calendar, result.eventId);
      return 'SKIPPED';
    }
    if (
      latest.status !== 'BOOKED' ||
      latest.order.status === 'CANCELED' ||
      slotRevision(latest.slot) !== revision
    ) {
      await this.db.$transaction((transaction) =>
        this.enqueueCalendar(transaction, appointment.id, true),
      );
      return 'SKIPPED';
    }
    await this.db.appointmentCommunication.update({
      where: { appointmentId: appointment.id },
      data: { ...result, syncedRevision: revision },
    });
    await this.enqueueReminders(appointment, latest, revision);
    return 'PROCESSED';
  }
  private async enqueueReminders(
    appointment: CommunicationAppointment,
    latest: CommunicationAppointment,
    revision: string,
  ) {
    const consent = latest.reminderConsent;
    if (
      !consent?.granted ||
      consent.revokedAt ||
      normalizedPhone(consent.phone) !==
        normalizedPhone(latest.order.customer.contact?.phone || '')
    )
      return;
    for (const lead of this.leads()) {
      const at = new Date(appointment.slot.startsAt.getTime() - lead * 60000);
      if (at <= new Date()) continue;
      const key = `whatsapp:${appointment.id}:${revision}:${consent.decidedAt.toISOString()}:${lead}`;
      await this.db.outboxMessage.upsert({
        where: { deduplicationKey: key },
        create: {
          eventCode: 'APPOINTMENT_WHATSAPP_REMINDER',
          payload: {
            appointmentId: appointment.id,
            revision,
            consentAt: consent.decidedAt.toISOString(),
          },
          availableAt: at,
          deduplicationKey: key,
        },
        update: {},
      });
    }
  }
  private async sendReminder(
    appointment: CommunicationAppointment,
    payload: Prisma.JsonObject,
    revision: string,
  ) {
    const consent = appointment.reminderConsent;
    const phone = appointment.order.customer.contact?.phone;
    if (
      appointment.status !== 'BOOKED' ||
      appointment.order.status !== 'CONFIRMED' ||
      appointment.slot.startsAt <= new Date() ||
      payload.revision !== revision ||
      !appointment.order.paymentTransactions.some(
        (payment) => payment.status === 'APPROVED' && payment.confirmedAt,
      ) ||
      !consent?.granted ||
      consent.revokedAt ||
      payload.consentAt !== consent.decidedAt.toISOString() ||
      !phone ||
      normalizedPhone(phone) !== normalizedPhone(consent.phone)
    )
      return 'SKIPPED';
    if (
      !appointment.communication?.meetUrl ||
      appointment.communication.syncedRevision !== revision
    )
      throw new ProviderError('MEET_LINK_NOT_READY', true);
    await this.whatsapp.reminder(
      phone,
      appointment.order.customer.socialName ||
        appointment.order.customer.legalName,
      appointment.slot.startsAt,
      appointment.communication.meetUrl,
    );
    return 'ACCEPTED';
  }
  private async processJob(job: CommunicationJob) {
    try {
      const status = await this.run(job.eventCode, job.payload);
      await this.db.outboxMessage.update({
        where: { id: job.id },
        data: {
          status,
          processedAt: new Date(),
          leaseUntil: null,
          lastErrorCode: null,
        },
      });
    } catch (error) {
      const failure =
        error instanceof ProviderError
          ? error
          : new ProviderError('PROCESSING_ERROR');
      let status: 'MANUAL_REVIEW' | 'RETRY' | 'FAILED' = 'FAILED';
      if (failure.uncertain) status = 'MANUAL_REVIEW';
      else if (failure.retryable && job.attempts < 8) status = 'RETRY';
      await this.db.outboxMessage.update({
        where: { id: job.id },
        data: {
          status,
          lastErrorCode: failure.code,
          leaseUntil: null,
          availableAt: new Date(
            Date.now() + Math.min(3600, 30 * 2 ** job.attempts) * 1000,
          ),
        },
      });
    }
  }
  async processDue() {
    if (!this.enabled()) return { enabled: false, attempted: 0 };
    if (this.running) return { enabled: true, attempted: 0, busy: true };
    this.running = true;
    try {
      // A crashed WhatsApp dispatch is ambiguous. Hold for review instead of sending twice.
      await this.db.outboxMessage.updateMany({
        where: {
          status: 'PROCESSING',
          leaseUntil: { lt: new Date() },
          eventCode: 'APPOINTMENT_WHATSAPP_REMINDER',
        },
        data: { status: 'MANUAL_REVIEW', lastErrorCode: 'DELIVERY_UNCERTAIN' },
      });
      await this.db.outboxMessage.updateMany({
        where: {
          status: 'PROCESSING',
          leaseUntil: { lt: new Date() },
          eventCode: 'APPOINTMENT_CALENDAR_SYNC',
        },
        data: { status: 'RETRY' },
      });
      const jobs = await this.db.$queryRaw<
        CommunicationJob[]
      >`UPDATE "OutboxMessage" SET "status"='PROCESSING',"attempts"="attempts"+1,"leaseUntil"=NOW()+INTERVAL '5 minutes' WHERE "id" IN (SELECT "id" FROM "OutboxMessage" WHERE "status" IN ('PENDING','RETRY') AND "availableAt"<=NOW() AND "eventCode" IN ('APPOINTMENT_CALENDAR_SYNC','APPOINTMENT_WHATSAPP_REMINDER') ORDER BY "availableAt" LIMIT 5 FOR UPDATE SKIP LOCKED) RETURNING "id","eventCode","payload","attempts"`;
      for (const job of jobs) await this.processJob(job);
      return { enabled: true, attempted: jobs.length };
    } finally {
      this.running = false;
    }
  }
}
