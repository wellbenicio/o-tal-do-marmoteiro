import { Injectable } from '@nestjs/common';
import { hashPassword, verifyPassword } from './admin/credentials';

/**
 * Porta de hashing de senha (seção 7.3 "recuperação/segurança"; seção 35
 * "hashing seguro de senha"). Abstract class — não `interface` — para
 * servir também como token de injeção de dependência do NestJS (ver
 * `IdentityModule`). Ver docs/adr/0012-autenticacao-e-rbac.md.
 */
export abstract class PasswordHasher {
  /** Gera o hash a ser persistido em `Identity.passwordHash`/`AdminUser.passwordHash`. */
  abstract hash(plain: string): Promise<string>;
  /** Compara `plain` (senha informada no login) contra o hash armazenado. */
  abstract verify(plain: string, storedHash: string): Promise<boolean>;
}

/**
 * Implementação real (não uma fake/in-memory) usando scrypt — módulo
 * `crypto` nativo do Node, sem dependência nova. Diferente do padrão
 * porta+fake usado para `BusinessHoursCalendar`/`SessionStore`: hashing de
 * senha é decisão puramente técnica (não depende de fornecedor externo
 * nem de dado de negócio ainda não definido), então já nasce completa —
 * ver docs/adr/0012-autenticacao-e-rbac.md.
 */
@Injectable()
export class ScryptPasswordHasher extends PasswordHasher {
  hash(plain: string): Promise<string> {
    return hashPassword(plain);
  }

  verify(plain: string, storedHash: string): Promise<boolean> {
    return verifyPassword(plain, storedHash);
  }
}
