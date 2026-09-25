import { Test, TestingModule } from '@nestjs/testing';
import { AuthRole } from '@marmoteiro/shared';
import { InMemorySessionStore, SessionStore } from './session-store';

describe('InMemorySessionStore', () => {
  let store: SessionStore;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: SessionStore, useClass: InMemorySessionStore }],
    }).compile();

    store = module.get(SessionStore);
  });

  it('cria uma sessão recuperável pelo token retornado', async () => {
    const session = await store.create('customer-1', AuthRole.CUSTOMER, 60_000);
    const found = await store.find(session.token);

    expect(found).toEqual(session);
  });

  it('gera tokens diferentes a cada sessão criada', async () => {
    const sessionA = await store.create(
      'customer-1',
      AuthRole.CUSTOMER,
      60_000,
    );
    const sessionB = await store.create(
      'customer-1',
      AuthRole.CUSTOMER,
      60_000,
    );

    expect(sessionA.token).not.toBe(sessionB.token);
  });

  it('retorna undefined para um token inexistente', async () => {
    await expect(store.find('token-inexistente')).resolves.toBeUndefined();
  });

  it('revoga uma sessão explicitamente', async () => {
    const session = await store.create('admin-1', AuthRole.ADMIN, 60_000);
    await store.revoke(session.token);

    await expect(store.find(session.token)).resolves.toBeUndefined();
  });

  it('trata uma sessão expirada como inexistente', async () => {
    const session = await store.create('customer-2', AuthRole.CUSTOMER, -1);

    await expect(store.find(session.token)).resolves.toBeUndefined();
  });
});
