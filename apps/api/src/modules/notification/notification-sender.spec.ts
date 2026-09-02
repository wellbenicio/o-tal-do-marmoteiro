import { Test, TestingModule } from '@nestjs/testing';
import {
  InMemoryNotificationAdapter,
  NotificationPort,
} from './notification-sender';

describe('InMemoryNotificationAdapter', () => {
  let port: NotificationPort;
  let adapter: InMemoryNotificationAdapter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: NotificationPort, useClass: InMemoryNotificationAdapter },
      ],
    }).compile();

    port = module.get(NotificationPort);
    adapter = module.get(NotificationPort);
  });

  it('registra a mensagem enviada para observação em teste', async () => {
    const message = {
      recipient: '+5511999999999',
      eventCode: 'PAYMENT_CONFIRMED',
      content: 'Seu pagamento foi confirmado.',
    };

    await port.send(message);

    expect(adapter.sentMessages).toEqual([message]);
  });

  it('registra múltiplas mensagens na ordem de envio', async () => {
    const first = {
      recipient: '+5511999999999',
      eventCode: 'ACCOUNT_CREATED',
      content: 'Bem-vindo!',
    };
    const second = {
      recipient: '+5511999999999',
      eventCode: 'PAYMENT_CONFIRMED',
      content: 'Seu pagamento foi confirmado.',
    };

    await port.send(first);
    await port.send(second);

    expect(adapter.sentMessages).toEqual([first, second]);
  });
});
