import { Test, TestingModule } from '@nestjs/testing';
import { PasswordHasher, ScryptPasswordHasher } from './password-hasher';
import { hashPassword, verifyPassword } from './admin/credentials';

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
    expect(hash).toMatch(/^scrypt\$32768\$8\$3\$/);
  });

  it('gera hashes diferentes para a mesma senha (salt aleatório)', async () => {
    const hashA = await hasher.hash('mesma-senha-de-teste');
    const hashB = await hasher.hash('mesma-senha-de-teste');
    expect(hashA).not.toBe(hashB);
  });

  it('confirma a senha correta contra o hash armazenado', async () => {
    const hash = await hasher.hash('senha-correta-de-teste');
    await expect(hasher.verify('senha-correta-de-teste', hash)).resolves.toBe(
      true,
    );
  });

  it('rejeita a senha incorreta', async () => {
    const hash = await hasher.hash('senha-correta-de-teste');
    await expect(hasher.verify('senha-errada', hash)).resolves.toBe(false);
  });

  it('uses the same format and minimum length as administrative credentials', async () => {
    const password = 'compatible test passphrase';
    await expect(
      hasher.verify(password, await hashPassword(password)),
    ).resolves.toBe(true);
    await expect(
      verifyPassword(password, await hasher.hash(password)),
    ).resolves.toBe(true);
    await expect(hasher.hash('short')).rejects.toThrow();
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
