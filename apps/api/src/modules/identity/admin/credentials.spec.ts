import {
  hashPassword,
  verifyPassword,
  newSessionToken,
  tokenHash,
  normalizeEmail,
} from './credentials';
describe('administrative credentials', () => {
  it('hashes with fresh salt, verifies password and never accepts a missing/malformed hash', async () => {
    const password = 'A long test passphrase 2026';
    const a = await hashPassword(password),
      b = await hashPassword(password);
    expect(a).not.toBe(b);
    expect(a).not.toContain(password);
    expect(await verifyPassword(password, a)).toBe(true);
    expect(await verifyPassword(password + 'wrong', a)).toBe(false);
    expect(await verifyPassword(password, null)).toBe(false);
    expect(await verifyPassword(password, 'invalid')).toBe(false);
  });
  it('rejects short passwords and creates opaque non-reversible session identifiers', async () => {
    await expect(hashPassword('short')).rejects.toThrow();
    const a = newSessionToken(),
      b = newSessionToken();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(tokenHash(a)).toHaveLength(64);
    expect(tokenHash(a)).not.toBe(a);
    expect(normalizeEmail(' ADMIN@EXAMPLE.COM ')).toBe('admin@example.com');
  });
});
