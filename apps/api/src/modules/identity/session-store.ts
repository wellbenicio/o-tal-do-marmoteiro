import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { AuthRole } from '@marmoteiro/shared';

/** Token opaco de sessão emitido no login e revogável a qualquer momento (seção 7.3). */
export interface Session {
  token: string;
  principalId: string;
  role: AuthRole;
  expiresAt: Date;
}

/**
 * Porta de armazenamento de sessão (seção 7.3: "controle seguro de sessão"
 * e "revogação de sessão quando necessário"). Abstract class — não
 * `interface` — para servir também como token de injeção de dependência
 * do NestJS (ver `IdentityModule`).
 *
 * Métodos assíncronos (diferente de `BusinessHoursCalendar`, que é
 * síncrona): um backend real de sessão (ex.: Redis) é genuinamente
 * dependente de I/O, então a porta já nasce `Promise`-based para não
 * exigir uma reescrita de assinatura quando a implementação real chegar.
 * Ver docs/adr/0012-autenticacao-e-rbac.md.
 *
 * Somente a implementação em memória (`InMemorySessionStore`) é
 * fornecida nesta ADR — mesmo padrão porta+fake usado para
 * `BusinessHoursCalendar` (ADR 0009): a escolha de um backend real e
 * persistente entre reinícios do processo é decisão de infraestrutura
 * fora do escopo atual.
 */
export abstract class SessionStore {
  abstract create(
    principalId: string,
    role: AuthRole,
    ttlMs: number,
  ): Promise<Session>;
  abstract find(token: string): Promise<Session | undefined>;
  abstract revoke(token: string): Promise<void>;
}

/**
 * Implementação em memória de `SessionStore` — perde todas as sessões ao
 * reiniciar o processo e não escala além de uma única instância. Adequada
 * apenas para viabilizar o mecanismo de autenticação de ponta a ponta em
 * ambiente de desenvolvimento/teste; um backend real (ex.: Redis) é
 * decisão de infraestrutura a tratar em ADR futura.
 */
@Injectable()
export class InMemorySessionStore extends SessionStore {
  private readonly sessions = new Map<string, Session>();

  create(principalId: string, role: AuthRole, ttlMs: number): Promise<Session> {
    const token = randomBytes(32).toString('hex');
    const session: Session = {
      token,
      principalId,
      role,
      expiresAt: new Date(Date.now() + ttlMs),
    };
    this.sessions.set(token, session);
    return Promise.resolve(session);
  }

  find(token: string): Promise<Session | undefined> {
    const session = this.sessions.get(token);
    if (!session) {
      return Promise.resolve(undefined);
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      this.sessions.delete(token);
      return Promise.resolve(undefined);
    }

    return Promise.resolve(session);
  }

  revoke(token: string): Promise<void> {
    this.sessions.delete(token);
    return Promise.resolve();
  }
}
