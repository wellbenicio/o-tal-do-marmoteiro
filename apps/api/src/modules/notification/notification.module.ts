import { Module } from '@nestjs/common';
import {
  NotificationPort,
  InMemoryNotificationAdapter,
} from './notification-sender';

/**
 * Domínio: Notification (comunicações transacionais).
 * Fonte: especificação funcional, seção 24 (Comunicações transacionais),
 * com envio via WhatsApp conforme seção 11.6. Porta de envio
 * (`NotificationPort`) definida em
 * docs/adr/0013-portas-de-integracao-externa.md — só a implementação em
 * memória está registrada; o provedor real (WhatsApp Business API,
 * e-mail transacional) é decisão de negócio pendente.
 */
@Module({
  providers: [
    { provide: NotificationPort, useClass: InMemoryNotificationAdapter },
  ],
  exports: [NotificationPort],
})
export class NotificationModule {}
