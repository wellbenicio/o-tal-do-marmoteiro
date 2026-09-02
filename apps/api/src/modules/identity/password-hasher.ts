import { Injectable } from '@nestjs/common';
import { randomBytes, scrypt, timingSafeEqual } from 'crypto';

function scryptAsync(
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keylen, (err, derivedKey) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(derivedKey);
    });
  });
}

/** Tamanho do salt aleatório gerado por hash (bytes). */
const SALT_BYTES = 16;
/** Tamanho da chave derivada pelo scrypt (bytes). */
const KEY_LENGTH = 64;

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
  async hash(plain: string): Promise<string> {
    const salt = randomBytes(SALT_BYTES);
    const derivedKey = await scryptAsync(plain, salt, KEY_LENGTH);
    return `${salt.toString('hex')}:${derivedKey.toString('hex')}`;
  }

  async verify(plain: string, storedHash: string): Promise<boolean> {
    const separatorIndex = storedHash.indexOf(':');
    if (separatorIndex <= 0 || separatorIndex === storedHash.length - 1) {
      return false;
    }

    const saltHex = storedHash.slice(0, separatorIndex);
    const storedKey = Buffer.from(storedHash.slice(separatorIndex + 1), 'hex');
    if (storedKey.length === 0) {
      return false;
    }

    const derivedKey = await scryptAsync(
      plain,
      Buffer.from(saltHex, 'hex'),
      storedKey.length,
    );
    return timingSafeEqual(derivedKey, storedKey);
  }
}
