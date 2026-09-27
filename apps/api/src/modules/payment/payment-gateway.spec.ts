import { Test, TestingModule } from '@nestjs/testing';
import { PaymentStatus } from '@marmoteiro/shared';
import {
  FakePaymentGatewayAdapter,
  PaymentGatewayPort,
} from './payment-gateway';

describe('FakePaymentGatewayAdapter', () => {
  let gateway: PaymentGatewayPort;
  let fake: FakePaymentGatewayAdapter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: PaymentGatewayPort, useClass: FakePaymentGatewayAdapter },
      ],
    }).compile();

    gateway = module.get(PaymentGatewayPort);
    fake = module.get(PaymentGatewayPort);
  });

  it('retorna uma cobrança pendente com referência opaca', async () => {
    const result = await gateway.charge({
      orderId: 'order-1',
      amount: 199.9,
      currency: 'BRL',
    });

    expect(result.status).toBe(PaymentStatus.PENDING);
    expect(result.provider).toBe(FakePaymentGatewayAdapter.PROVIDER_NAME);
    expect(result.providerReference).toEqual(expect.any(String));
  });

  it('gera referências diferentes a cada cobrança', async () => {
    const first = await gateway.charge({
      orderId: 'order-1',
      amount: 100,
      currency: 'BRL',
    });
    const second = await gateway.charge({
      orderId: 'order-2',
      amount: 100,
      currency: 'BRL',
    });

    expect(first.providerReference).not.toBe(second.providerReference);
  });

  it('registra as cobranças recebidas para observação em teste', async () => {
    const request = { orderId: 'order-1', amount: 199.9, currency: 'BRL' };
    await gateway.charge(request);

    expect(fake.charges).toEqual([request]);
  });

  it('retorna um estorno pendente preservando a referência informada', async () => {
    const result = await gateway.refund({
      providerReference: 'ref-123',
      amount: 50,
    });

    expect(result).toEqual({
      providerReference: 'ref-123',
      status: PaymentStatus.REFUND_PENDING,
    });
  });

  it('registra os estornos recebidos para observação em teste', async () => {
    const request = { providerReference: 'ref-123', amount: 50 };
    await gateway.refund(request);

    expect(fake.refunds).toEqual([request]);
  });
});
