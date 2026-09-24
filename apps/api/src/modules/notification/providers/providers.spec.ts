import { ConfigService } from '@nestjs/config';
import {
  GoogleCalendarGateway,
  calendarEventBody,
  calendarEventId,
} from './google-calendar';
import { WhatsAppGateway, reminderTemplate } from './whatsapp';
import { ProviderError } from './provider-error';
const appointment = {
  reference: 'order-one',
  startsAt: new Date('2026-10-05T17:00:00Z'),
  endsAt: new Date('2026-10-05T17:30:00Z'),
  customerEmail: 'test@example.com',
};
const originalFetch = global.fetch;
const requestUrl = (input: string | URL | Request) =>
  input instanceof Request ? input.url : input.toString();
afterEach(() => {
  global.fetch = originalFetch;
});
function config() {
  return new ConfigService({
    GOOGLE_CLIENT_ID: 'client',
    GOOGLE_CLIENT_SECRET: 'secret',
    GOOGLE_REFRESH_TOKEN: 'refresh',
    GOOGLE_CALENDAR_ID: 'calendar',
    WHATSAPP_GRAPH_VERSION: 'v25.0',
    WHATSAPP_ACCESS_TOKEN: 'token',
    WHATSAPP_PHONE_NUMBER_ID: 'number',
    WHATSAPP_REMINDER_TEMPLATE: 'lembrete_consulta',
  });
}
describe('appointment providers', () => {
  it('uses a stable event ID, unique conference per appointment, private generic event and one invited customer', () => {
    const body = calendarEventBody(appointment);
    expect(calendarEventId(appointment.reference)).toMatch(/^[0-9a-f]{64}$/);
    expect(calendarEventId('another')).not.toBe(
      calendarEventId(appointment.reference),
    );
    expect(body.visibility).toBe('private');
    expect(body.guestsCanSeeOtherGuests).toBe(false);
    expect(body.attendees).toEqual([{ email: 'test@example.com' }]);
    expect(body.conferenceData?.createRequest.conferenceSolutionKey.type).toBe(
      'hangoutsMeet',
    );
    expect(body.start.timeZone).toBe('America/Sao_Paulo');
  });
  it('creates Meet plus invitation with sendUpdates=all and retries reuse the existing event without another insert', async () => {
    let stored = false;
    const event = {
      id: calendarEventId(appointment.reference),
      htmlLink: 'https://www.google.com/calendar/event?eid=test',
      hangoutLink: 'https://meet.google.com/abc-defg-hij',
      start: { dateTime: appointment.startsAt.toISOString() },
      end: { dateTime: appointment.endsAt.toISOString() },
      attendees: [{ email: appointment.customerEmail }],
      conferenceData: {},
    };
    const mocked = jest.fn(
      (input: string | URL | Request, init?: RequestInit) => {
        const url = requestUrl(input);
        if (url.includes('oauth2'))
          return Promise.resolve(
            new Response(
              JSON.stringify({ access_token: 'access', expires_in: 3600 }),
            ),
          );
        if (init?.method === 'GET')
          return Promise.resolve(
            stored
              ? new Response(JSON.stringify(event))
              : new Response('', { status: 404 }),
          );
        expect(url).toContain('conferenceDataVersion=1&sendUpdates=all');
        expect(init?.method).toBe('POST');
        stored = true;
        return Promise.resolve(new Response(JSON.stringify(event)));
      },
    );
    global.fetch = mocked;
    const gateway = new GoogleCalendarGateway(config());
    expect((await gateway.upsert(appointment)).meetUrl).toBe(event.hangoutLink);
    await gateway.upsert(appointment);
    expect(
      mocked.mock.calls.filter(
        ([url, init]) =>
          requestUrl(url).includes('calendar/v3') && init?.method === 'POST',
      ),
    ).toHaveLength(1);
  });
  it('does not invent a Meet URL while conference generation is pending', async () => {
    global.fetch = jest.fn((input: string | URL | Request) =>
      Promise.resolve(
        new Response(
          JSON.stringify(
            requestUrl(input).includes('oauth2')
              ? { access_token: 'access' }
              : {
                  id: 'event',
                  start: { dateTime: appointment.startsAt.toISOString() },
                  end: { dateTime: appointment.endsAt.toISOString() },
                  attendees: [{ email: appointment.customerEmail }],
                  conferenceData: {
                    createRequest: { status: { statusCode: 'pending' } },
                  },
                },
          ),
        ),
      ),
    );
    await expect(
      new GoogleCalendarGateway(config()).upsert(appointment),
    ).rejects.toMatchObject({ code: 'GOOGLE_MEET_PENDING', retryable: true });
  });
  it('formats a utility template in Brasília and treats timeouts as uncertain instead of retrying blindly', async () => {
    const body = reminderTemplate(
      'lembrete',
      '(85) 99999-0000',
      'Marina Silva',
      appointment.startsAt,
      'https://meet.google.com/abc-defg-hij',
    );
    expect(body.to).toBe('5585999990000');
    expect(body.template.components[0].parameters.map((p) => p.text)).toEqual([
      'Marina',
      '05/10/2026',
      '14:00',
      'https://meet.google.com/abc-defg-hij',
    ]);
    global.fetch = jest.fn().mockRejectedValue(new Error('timeout'));
    await expect(
      new WhatsAppGateway(config()).reminder(
        body.to,
        'Marina',
        appointment.startsAt,
        'https://meet.google.com/abc-defg-hij',
      ),
    ).rejects.toEqual(
      new ProviderError('WHATSAPP_DELIVERY_UNCERTAIN', false, true),
    );
  });
  it('rejects missing provider settings without making network calls', async () => {
    global.fetch = jest.fn();
    await expect(
      new GoogleCalendarGateway(new ConfigService()).upsert(appointment),
    ).rejects.toMatchObject({ code: 'GOOGLE_NOT_CONFIGURED' });
    await expect(
      new WhatsAppGateway(new ConfigService()).reminder(
        '5585999990000',
        'Marina',
        appointment.startsAt,
        'https://meet.google.com/abc-defg-hij',
      ),
    ).rejects.toMatchObject({ code: 'WHATSAPP_NOT_CONFIGURED' });
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
