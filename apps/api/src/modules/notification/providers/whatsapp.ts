import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProviderError } from './provider-error';
export function normalizedPhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 11 ? '55' + digits : digits;
}
export function reminderTemplate(
  template: string,
  phone: string,
  name: string,
  startsAt: Date,
  meetUrl: string,
) {
  const date = startsAt.toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
  });
  const time = startsAt.toLocaleTimeString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
  });
  return {
    messaging_product: 'whatsapp',
    to: normalizedPhone(phone),
    type: 'template',
    template: {
      name: template,
      language: { code: 'pt_BR' },
      components: [
        {
          type: 'body',
          parameters: [name.split(' ')[0], date, time, meetUrl].map((text) => ({
            type: 'text',
            text,
          })),
        },
      ],
    },
  };
}
@Injectable()
export class WhatsAppGateway {
  constructor(private readonly config: ConfigService) {}
  configured() {
    return (
      [
        'WHATSAPP_ACCESS_TOKEN',
        'WHATSAPP_PHONE_NUMBER_ID',
        'WHATSAPP_REMINDER_TEMPLATE',
        'WHATSAPP_GRAPH_VERSION',
      ].every((k) => !!this.config.get<string>(k)) &&
      /^v\d+\.\d+$/.test(
        this.config.get<string>('WHATSAPP_GRAPH_VERSION') || '',
      )
    );
  }
  async reminder(phone: string, name: string, startsAt: Date, meetUrl: string) {
    if (!this.configured()) throw new ProviderError('WHATSAPP_NOT_CONFIGURED');
    if (
      !/^[1-9]\d{10,14}$/.test(normalizedPhone(phone)) ||
      !/^https:\/\/meet\.google\.com\/[a-z-]+$/.test(meetUrl)
    )
      throw new ProviderError('WHATSAPP_INVALID_RECIPIENT_OR_LINK');
    const url = `https://graph.facebook.com/${this.config.getOrThrow<string>('WHATSAPP_GRAPH_VERSION')}/${encodeURIComponent(this.config.getOrThrow<string>('WHATSAPP_PHONE_NUMBER_ID'))}/messages`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization:
          'Bearer ' + this.config.getOrThrow<string>('WHATSAPP_ACCESS_TOKEN'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        reminderTemplate(
          this.config.getOrThrow<string>('WHATSAPP_REMINDER_TEMPLATE'),
          phone,
          name,
          startsAt,
          meetUrl,
        ),
      ),
      signal: AbortSignal.timeout(15000),
    }).catch(() => {
      throw new ProviderError('WHATSAPP_DELIVERY_UNCERTAIN', false, true);
    });
    if (response.status === 429)
      throw new ProviderError('WHATSAPP_RATE_LIMIT', true);
    if (response.status >= 500)
      throw new ProviderError('WHATSAPP_DELIVERY_UNCERTAIN', false, true);
    if (!response.ok)
      throw new ProviderError(`WHATSAPP_HTTP_${response.status}`);
    const data = (await response.json()) as { messages?: { id: string }[] };
    if (!data.messages?.[0]?.id)
      throw new ProviderError('WHATSAPP_DELIVERY_UNCERTAIN', false, true);
    return data.messages[0].id;
  }
}
