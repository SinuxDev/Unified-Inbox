import { PasswordService } from './password.service';

describe('PasswordService', () => {
  const service = new PasswordService();

  it('hashes and verifies a password', async () => {
    const hash = await service.hash('secret123');
    expect(hash).not.toEqual('secret123');
    await expect(service.compare('secret123', hash)).resolves.toBe(true);
    await expect(service.compare('wrong', hash)).resolves.toBe(false);
  });
});
