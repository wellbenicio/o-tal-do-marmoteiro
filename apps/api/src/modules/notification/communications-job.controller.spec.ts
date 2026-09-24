import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import type { INestApplication } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import {
  CommunicationsJobController,
  CommunicationsJobGuard,
} from './communications-job.controller';
import { AppointmentCommunicationsService } from './appointment-communications.service';

describe('authenticated scheduled communications', () => {
  let app: INestApplication;
  let url: string;
  const secret = randomBytes(32).toString('hex');
  const processDue = jest
    .fn()
    .mockResolvedValue({ enabled: false, attempted: 0 });

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          ignoreEnvFile: true,
          load: [() => ({ OUTBOX_TRIGGER_SECRET: secret })],
        }),
      ],
      controllers: [CommunicationsJobController],
      providers: [
        CommunicationsJobGuard,
        { provide: AppointmentCommunicationsService, useValue: { processDue } },
      ],
    }).compile();
    app = module.createNestApplication();
    await app.listen(0, '127.0.0.1');
    url = (await app.getUrl()) + '/internal/jobs/communications';
  });
  afterAll(async () => {
    await app.close();
  });

  it('blocks callers without the dedicated job key and rejects an admin key', async () => {
    expect((await fetch(url, { method: 'POST' })).status).toBe(401);
    expect(
      (
        await fetch(url, {
          method: 'POST',
          headers: {
            'x-outbox-secret': 'wrong',
            'x-admin-service-key': secret,
          },
        })
      ).status,
    ).toBe(401);
    expect(processDue).not.toHaveBeenCalled();
  });
  it('waits for the batch before responding and does not claim delivery', async () => {
    processDue.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ enabled: true, attempted: 2 }), 50),
        ),
    );
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'x-outbox-secret': secret },
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ enabled: true, attempted: 2 });
    expect(processDue).toHaveBeenCalledTimes(1);
  });
});
