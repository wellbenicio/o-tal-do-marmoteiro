import { Injectable } from '@nestjs/common';

/**
 * Mensagem transacional a ser enviada (seção 24 lista os eventos mínimos:
 * criação de conta, confirmação de pagamento, reembolso iniciado etc.).
 * `eventCode` usa o mesmo formato livre de `OutboxMessage.eventCode`
 * (schema Prisma) — esta porta representa apenas o envio em si, não a
 * produção/consumo da fila de outbox (mecanismo separado, seção 24: "deverá
 * ser considerada abordagem orientada a eventos/outbox").
 */
export interface NotificationMessage {
  /** Destinatário — número de WhatsApp (seção 11.6) ou e-mail, conforme o canal. */
  recipient: string;
  eventCode: string;
  content: string;
}

/**
 * Porta de envio de notificação transacional (seção 24; canal WhatsApp
 * conforme seção 11.6). Abstract class — não `interface` — para servir
 * também como token de injeção de dependência do NestJS, mesmo padrão de
 * `SessionStore`/`PasswordHasher` (ADR 0012) e `PaymentGatewayPort` (ADR
 * 0013). Desacopla o domínio `Notification` do provedor real (WhatsApp
 * Business API, e-mail transacional), ainda não escolhido pelo dono do
 * produto.
 *
 * Só `InMemoryNotificationAdapter` é fornecida nesta ADR — a escolha do
 * provedor real é decisão de negócio pendente. Ver
 * docs/adr/0013-portas-de-integracao-externa.md.
 */
export abstract class NotificationPort {
  abstract send(message: NotificationMessage): Promise<void>;
}

/**
 * Implementação em memória de `NotificationPort` — nunca envia nada de
 * fato, apenas registra cada mensagem em `sentMessages` para observação em
 * teste. Adequada para viabilizar casos de uso de ponta a ponta em
 * desenvolvimento/teste sem depender do provedor real ainda não escolhido.
 */
@Injectable()
export class InMemoryNotificationAdapter extends NotificationPort {
  readonly sentMessages: NotificationMessage[] = [];

  send(message: NotificationMessage): Promise<void> {
    this.sentMessages.push(message);
    return Promise.resolve();
  }
}
