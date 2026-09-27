import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthRole } from '@marmoteiro/shared';
import { AuthGuard, RequestWithPrincipal } from './auth.guard';
import { InMemorySessionStore, SessionStore } from './session-store';

const AUTH_SCHEME = 'Bearer';

function toAuthorizationHeader(token: string): string {
  return [AUTH_SCHEME, token].join(' ');
}

function createContext(headers: Record<string, string>): ExecutionContext {
  const request = { headers } as RequestWithPrincipal;
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
}

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let sessionStore: SessionStore;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        { provide: SessionStore, useClass: InMemorySessionStore },
      ],
    }).compile();

    guard = module.get(AuthGuard);
    sessionStore = module.get(SessionStore);
  });

  it('permite a requisição e anexa o principal quando o token é válido', async () => {
    const session = await sessionStore.create(
      'customer-1',
      AuthRole.CUSTOMER,
      60_000,
    );
    const context = createContext({
      authorization: toAuthorizationHeader(session.token),
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);

    const request = context.switchToHttp().getRequest<RequestWithPrincipal>();
    expect(request.principal).toEqual({
      id: 'customer-1',
      role: AuthRole.CUSTOMER,
    });
  });

  it('rejeita quando o cabeçalho Authorization está ausente', async () => {
    const context = createContext({});

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejeita quando o cabeçalho não usa o esquema Bearer', async () => {
    const context = createContext({ authorization: 'Basic abc123' });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejeita quando o token não corresponde a nenhuma sessão', async () => {
    const context = createContext({
      authorization: toAuthorizationHeader('token-inexistente'),
    });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejeita quando a sessão já expirou', async () => {
    const session = await sessionStore.create(
      'customer-2',
      AuthRole.CUSTOMER,
      -1,
    );
    const context = createContext({
      authorization: toAuthorizationHeader(session.token),
    });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
