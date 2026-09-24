import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AppointmentCommunicationsService,
  slotRevision,
} from './appointment-communications.service';
import { GoogleCalendarGateway } from './providers/google-calendar';
import { WhatsAppGateway } from './providers/whatsapp';
import { ProviderError } from './providers/provider-error';

function fixture(eventCode = 'APPOINTMENT_WHATSAPP_REMINDER', enabled = true) {
  const slot = {
    id: 'slot',
    startsAt: new Date(Date.now() + 3 * 86400000),
    endsAt: new Date(Date.now() + 3 * 86400000 + 1800000),
  };
  const revision = slotRevision(slot);
  const consent = {
    granted: true,
    revokedAt: null as Date | null,
    phone: '5585999990000',
    decidedAt: new Date(),
    version: 'v1',
  };
  const appointment = {
    id: 'appointment',
    status: 'BOOKED',
    slot,
    communication: {
      calendarId: 'calendar',
      eventId: 'event',
      meetUrl: 'https://meet.google.com/abc-defg-hij',
      syncedRevision: revision,
    },
    reminderConsent: consent,
    order: {
      status: 'CONFIRMED',
      paymentTransactions: [
        { status: 'APPROVED', confirmedAt: new Date() as Date | null },
      ],
      customer: {
        legalName: 'Test Person',
        socialName: null,
        contact: { phone: consent.phone, email: 'test@example.com' },
      },
    },
  };
  const payload = {
    appointmentId: appointment.id,
    revision,
    consentAt: consent.decidedAt.toISOString(),
  };
  const db = {
    appointment: { findUnique: jest.fn().mockResolvedValue(appointment) },
    appointmentCommunication: {
      upsert: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    outboxMessage: {
      upsert: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    $queryRaw: jest
      .fn()
      .mockResolvedValue([{ id: 'job', eventCode, payload, attempts: 1 }]),
    $transaction: jest.fn().mockResolvedValue([]),
  };
  const google = {
    configured: () => true,
    calendarId: () => 'calendar',
    upsert: jest.fn().mockResolvedValue({
      eventId: 'event',
      calendarId: 'calendar',
      meetUrl: appointment.communication.meetUrl,
      calendarUrl: 'https://calendar.google.com/event',
    }),
    cancel: jest.fn().mockResolvedValue(undefined),
  };
  const whatsapp = {
    configured: () => true,
    reminder: jest.fn().mockResolvedValue('accepted-id'),
  };
  const service = new AppointmentCommunicationsService(
    db as unknown as PrismaService,
    new ConfigService({ COMMUNICATIONS_ENABLED: enabled ? 'true' : 'false' }),
    google as unknown as GoogleCalendarGateway,
    whatsapp as unknown as WhatsAppGateway,
  );
  return { service, db, google, whatsapp, appointment, payload };
}

describe('appointment communications worker', () => {
  it('does not create a background timer in scheduled mode', () => {
    const timer = jest.spyOn(global, 'setInterval');
    const f = fixture();
    try {
      f.service.onModuleInit();
      expect(f.service.runner()).toBe('scheduled');
      expect(timer).not.toHaveBeenCalled();
    } finally {
      f.service.onModuleDestroy();
      timer.mockRestore();
    }
  });
  it('keeps all providers and the outbox idle when disabled', async () => {
    const f = fixture(undefined, false);
    await f.service.processDue();
    expect(f.db.$queryRaw).not.toHaveBeenCalled();
    expect(f.whatsapp.reminder).not.toHaveBeenCalled();
    expect(f.google.upsert).not.toHaveBeenCalled();
  });
  it('sends a current, paid and consented reminder and records acceptance, not delivery', async () => {
    const f = fixture();
    await f.service.processDue();
    expect(f.whatsapp.reminder).toHaveBeenCalledTimes(1);
    expect(f.db.outboxMessage.update.mock.calls).toMatchObject([
      [{ data: { status: 'ACCEPTED' } }],
    ]);
  });
  it.each([
    'canceled',
    'cancellation-review',
    'rescheduled',
    'revoked',
    'changed-phone',
    'unpaid',
    'unconfirmed-payment',
    'new-consent',
    'past',
  ] as const)(
    'suppresses a %s reminder at dispatch time',
    async (condition) => {
      const f = fixture();
      if (condition === 'canceled') f.appointment.status = 'CANCELED';
      if (condition === 'cancellation-review')
        f.appointment.order.status = 'CANCELLATION_REQUESTED';
      if (condition === 'rescheduled') f.payload.revision = 'old';
      if (condition === 'revoked')
        f.appointment.reminderConsent.revokedAt = new Date();
      if (condition === 'changed-phone')
        f.appointment.order.customer.contact.phone = '5585999991111';
      if (condition === 'unpaid')
        f.appointment.order.paymentTransactions[0].status = 'PENDING';
      if (condition === 'unconfirmed-payment')
        f.appointment.order.paymentTransactions[0].confirmedAt = null;
      if (condition === 'new-consent')
        f.payload.consentAt = new Date(0).toISOString();
      if (condition === 'past') f.appointment.slot.startsAt = new Date(0);
      await f.service.processDue();
      expect(f.whatsapp.reminder).not.toHaveBeenCalled();
      expect(f.db.outboxMessage.update.mock.calls).toMatchObject([
        [{ data: { status: 'SKIPPED' } }],
      ]);
    },
  );
  it('holds ambiguous WhatsApp sends for manual review instead of duplicating', async () => {
    const f = fixture();
    f.whatsapp.reminder.mockRejectedValue(
      new ProviderError('DELIVERY_UNCERTAIN', false, true),
    );
    await f.service.processDue();
    expect(f.db.outboxMessage.update.mock.calls).toMatchObject([
      [{ data: { status: 'MANUAL_REVIEW' } }],
    ]);
  });
  it('reuses consent and slot versions in reminder deduplication keys', async () => {
    const f = fixture('APPOINTMENT_CALENDAR_SYNC');
    await f.service.processDue();
    await f.service.processDue();
    expect(f.db.outboxMessage.upsert).toHaveBeenCalledTimes(4);
    expect(f.db.outboxMessage.upsert.mock.calls[0]).toEqual(
      f.db.outboxMessage.upsert.mock.calls[2],
    );
    expect(f.db.outboxMessage.upsert.mock.calls[1]).toEqual(
      f.db.outboxMessage.upsert.mock.calls[3],
    );
    expect(f.whatsapp.reminder).not.toHaveBeenCalled();
  });
  it('removes the calendar event and queued reminders after effective cancellation', async () => {
    const f = fixture('APPOINTMENT_CALENDAR_SYNC');
    f.appointment.status = 'CANCELED';
    await f.service.processDue();
    expect(f.google.cancel).toHaveBeenCalledWith('calendar', 'event');
    expect(f.google.upsert).not.toHaveBeenCalled();
    expect(f.db.outboxMessage.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'SKIPPED' } }),
    );
  });
  it('reconciles cancellation during Google creation before scheduling reminders', async () => {
    const f = fixture('APPOINTMENT_CALENDAR_SYNC');
    f.db.appointment.findUnique
      .mockResolvedValueOnce(f.appointment)
      .mockResolvedValueOnce({ ...f.appointment, status: 'CANCELED' });
    await f.service.processDue();
    expect(f.google.upsert).toHaveBeenCalledTimes(1);
    expect(f.db.$transaction).toHaveBeenCalledWith(expect.any(Function));
    expect(f.db.appointmentCommunication.update).not.toHaveBeenCalled();
    expect(f.db.outboxMessage.upsert).not.toHaveBeenCalled();
  });
  it('removes a just-created event if the appointment disappeared during the external call', async () => {
    const f = fixture('APPOINTMENT_CALENDAR_SYNC');
    f.db.appointment.findUnique
      .mockResolvedValueOnce(f.appointment)
      .mockResolvedValueOnce(null);
    await f.service.processDue();
    expect(f.google.cancel).toHaveBeenCalledWith('calendar', 'event');
    expect(f.db.outboxMessage.upsert).not.toHaveBeenCalled();
  });
});
