import { Module } from '@nestjs/common';
import { PasswordHasher, ScryptPasswordHasher } from './password-hasher';
import { SessionStore, InMemorySessionStore } from './session-store';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from './roles.guard';

/**
 * Domínio: Identity (autenticação/credenciais).
 * Fonte: especificação funcional, seção 7 (Autenticação), seção 28
 * (Controle de acesso administrativo) e seção 35 (Segurança mínima
 * esperada). Mecanismo de autenticação/RBAC definido em
 * docs/adr/0012-autenticacao-e-rbac.md — hashing de senha (`PasswordHasher`),
 * sessão por token opaco (`SessionStore`) e guards HTTP (`AuthGuard`,
 * `RolesGuard`). Não expõe nenhum controller HTTP: não há endpoint real
 * de login/logout nesta ADR — ver "Pontos em aberto" da ADR 0012.
 */
@Module({
  providers: [
    { provide: PasswordHasher, useClass: ScryptPasswordHasher },
    { provide: SessionStore, useClass: InMemorySessionStore },
    AuthGuard,
    RolesGuard,
  ],
  exports: [PasswordHasher, SessionStore, AuthGuard, RolesGuard],
})
export class IdentityModule {}
