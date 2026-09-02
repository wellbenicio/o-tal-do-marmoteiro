import { Test, TestingModule } from '@nestjs/testing';
import { PasswordHasher, ScryptPasswordHasher } from './password-hasher';

describe('ScryptPasswordHasher', () => {
  let hasher: PasswordHasher;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: PasswordHasher, useClass: ScryptPasswordHasher }],
    }).compile();

    hasher = module.get(PasswordHasher);
  });

  it('gera um hash diferente do texto original', async () => {
    const hash = await hasher.hash('minha-senha-secreta');
    expect(hash).not.toBe('minha-senha-secreta');
    expect(hash).toContain(':');
  });

  it('gera hashes diferentes para a mesma senha (salt aleatório)', async () => {
    const hashA = await hasher.hash('mesma-senha');
    const hashB = await hasher.hash('mesma-senha');
    expect(hashA).not.toBe(hashB);
  });

  it('confirma a senha correta contra o hash armazenado', async () => {
    const hash = await hasher.hash('senha-correta');
    await expect(hasher.verify('senha-correta', hash)).resolves.toBe(true);
  });

  it('rejeita a senha incorreta', async () => {
    const hash = await hasher.hash('senha-correta');
    await expect(hasher.verify('senha-errada', hash)).resolves.toBe(false);
  });

  it('rejeita um hash malformado sem separador', async () => {
    await expect(
      hasher.verify('qualquer-senha', 'hashsemseparador'),
    ).resolves.toBe(false);
  });

  it('rejeita um hash malformado com segmento de chave vazio', async () => {
    await expect(hasher.verify('qualquer-senha', 'abcd1234:')).resolves.toBe(
      false,
    );
  });

  it('rejeita um hash malformado com segmento de salt vazio', async () => {
    await expect(hasher.verify('qualquer-senha', ':abcd1234')).resolves.toBe(
      false,
    );
  });
});
