import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthRole } from '@marmoteiro/shared';
import { RolesGuard } from './roles.guard';
import { ROLES_KEY } from './roles.decorator';
import { RequestWithPrincipal } from './auth.guard';
import { Principal } from './principal';

function createContext(principal: Principal | undefined): ExecutionContext {
  const request = { principal } as RequestWithPrincipal;
  const handler = () => undefined;
  class TargetClass {}

  return {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => handler,
    getClass: () => TargetClass,
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesGuard, Reflector],
    }).compile();

    guard = module.get(RolesGuard);
    reflector = module.get(Reflector);
  });

  it('permite o acesso quando nenhum papel é exigido', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = createContext({
      id: 'customer-1',
      role: AuthRole.CUSTOMER,
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('permite o acesso quando o principal tem um dos papéis exigidos', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([AuthRole.ADMIN]);
    const context = createContext({ id: 'admin-1', role: AuthRole.ADMIN });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('nega o acesso quando o principal não tem o papel exigido', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([AuthRole.ADMIN]);
    const context = createContext({
      id: 'customer-1',
      role: AuthRole.CUSTOMER,
    });

    expect(guard.canActivate(context)).toBe(false);
  });

  it('nega o acesso quando não há principal anexado à requisição', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([AuthRole.ADMIN]);
    const context = createContext(undefined);

    expect(guard.canActivate(context)).toBe(false);
  });

  it('consulta a metadata declarada por @Roles no handler e na classe', () => {
    const spy = jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([AuthRole.ADMIN]);
    const context = createContext({ id: 'admin-1', role: AuthRole.ADMIN });

    guard.canActivate(context);

    expect(spy).toHaveBeenCalledWith(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  });
});
