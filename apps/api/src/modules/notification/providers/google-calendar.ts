import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'node:crypto';
import {
  ProviderError,
  type CalendarAppointment,
  type CalendarEvent,
} from './provider-error';
export function calendarEventId(reference: string) {
  return createHash('sha256')
    .update('marmoteiro:appointment:' + reference)
    .digest('hex');
}
export function calendarEventBody(
  appointment: CalendarAppointment,
  withConference = true,
) {
  return {
    summary: 'Atendimento · O Tal do Marmoteiro',
    description:
      'Consulta online. Detalhes e alterações disponíveis na sua área do site.',
    visibility: 'private',
    guestsCanInviteOthers: false,
    guestsCanModify: false,
    guestsCanSeeOtherGuests: false,
    start: {
      dateTime: appointment.startsAt.toISOString(),
      timeZone: 'America/Sao_Paulo',
    },
    end: {
      dateTime: appointment.endsAt.toISOString(),
      timeZone: 'America/Sao_Paulo',
    },
    attendees: [{ email: appointment.customerEmail }],
    ...(withConference
      ? {
          conferenceData: {
            createRequest: {
              requestId: calendarEventId(appointment.reference),
              conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
          },
        }
      : {}),
  };
}
@Injectable()
export class GoogleCalendarGateway {
  private cached?: { token: string; until: number };
  constructor(private readonly config: ConfigService) {}
  configured() {
    return [
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'GOOGLE_REFRESH_TOKEN',
      'GOOGLE_CALENDAR_ID',
    ].every((k) => !!this.config.get<string>(k));
  }
  calendarId() {
    return this.config.get<string>('GOOGLE_CALENDAR_ID') || '';
  }
  private async token() {
    if (this.cached && this.cached.until > Date.now()) return this.cached.token;
    if (!this.configured()) throw new ProviderError('GOOGLE_NOT_CONFIGURED');
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
        client_secret: this.config.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
        refresh_token: this.config.getOrThrow<string>('GOOGLE_REFRESH_TOKEN'),
        grant_type: 'refresh_token',
      }),
      signal: AbortSignal.timeout(12000),
    }).catch(() => {
      throw new ProviderError('GOOGLE_TOKEN_UNAVAILABLE', true);
    });
    if (!response.ok) throw new ProviderError('GOOGLE_AUTH_REQUIRED');
    const data = (await response.json()) as {
      access_token?: string;
      expires_in?: number;
    };
    if (!data.access_token) throw new ProviderError('GOOGLE_AUTH_REQUIRED');
    this.cached = {
      token: data.access_token,
      until: Date.now() + Math.max(0, (data.expires_in || 3600) - 60) * 1000,
    };
    return data.access_token;
  }
  private async request(
    calendar: string,
    eventId: string | undefined,
    method: string,
    body?: unknown,
  ) {
    const token = await this.token();
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendar)}/events${eventId ? '/' + encodeURIComponent(eventId) : ''}?conferenceDataVersion=1&sendUpdates=all`;
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(15000),
    }).catch(() => {
      throw new ProviderError('GOOGLE_NETWORK_RETRY', true);
    });
    if (response.status === 401) {
      this.cached = undefined;
      throw new ProviderError('GOOGLE_AUTH_REQUIRED');
    }
    return response;
  }
  private check(response: Response) {
    if (!response.ok)
      throw new ProviderError(
        `GOOGLE_HTTP_${response.status}`,
        response.status === 429 || response.status >= 500,
      );
  }
  async upsert(appointment: CalendarAppointment, calendar = this.calendarId()) {
    const id = calendarEventId(appointment.reference);
    let response = await this.request(calendar, id, 'GET');
    let event: CalendarEvent;
    if (response.status === 404) {
      response = await this.request(calendar, undefined, 'POST', {
        id,
        ...calendarEventBody(appointment),
      });
      if (response.status === 409)
        response = await this.request(calendar, id, 'GET');
      this.check(response);
      event = (await response.json()) as CalendarEvent;
    } else {
      this.check(response);
      event = (await response.json()) as CalendarEvent;
      if (event.status === 'cancelled')
        throw new ProviderError('GOOGLE_EVENT_DELETED_REVIEW');
      const unchanged =
        Date.parse(event.start?.dateTime || '') ===
          appointment.startsAt.getTime() &&
        Date.parse(event.end?.dateTime || '') ===
          appointment.endsAt.getTime() &&
        event.attendees?.some(
          (a) =>
            a.email.toLowerCase() === appointment.customerEmail.toLowerCase(),
        );
      if (!unchanged) {
        response = await this.request(
          calendar,
          id,
          'PATCH',
          calendarEventBody(appointment, !event.conferenceData),
        );
        this.check(response);
        event = (await response.json()) as CalendarEvent;
      }
    }
    const meet =
      event.hangoutLink ||
      event.conferenceData?.entryPoints?.find(
        (p) => p.entryPointType === 'video',
      )?.uri;
    const conferenceState =
      event.conferenceData?.createRequest?.status?.statusCode;
    if (conferenceState === 'failure')
      throw new ProviderError('GOOGLE_MEET_CREATION_FAILED');
    if (!meet) throw new ProviderError('GOOGLE_MEET_PENDING', true);
    if (
      !/^https:\/\/meet\.google\.com\/[a-z-]+$/.test(meet) ||
      !event.htmlLink?.startsWith('https://')
    )
      throw new ProviderError('GOOGLE_INVALID_EVENT_LINK');
    return {
      eventId: id,
      calendarId: calendar,
      meetUrl: meet,
      calendarUrl: event.htmlLink,
    };
  }
  async cancel(calendar: string, eventId: string) {
    const response = await this.request(calendar, eventId, 'DELETE');
    if (![404, 410].includes(response.status)) this.check(response);
  }
}
