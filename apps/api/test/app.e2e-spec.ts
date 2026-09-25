import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configureHttp } from './../src/common/http-configuration';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication({ bodyParser: false });
    configureHttp(app);
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('preserves unversioned administrative and internal endpoints', async () => {
    await request(app.getHttpServer())
      .get('/admin/auth/session')
      .expect('Cache-Control', 'no-store')
      .expect(401);
    await request(app.getHttpServer())
      .get('/api/v1/admin/auth/session')
      .expect(404);
    await request(app.getHttpServer())
      .post('/internal/jobs/communications')
      .expect('Cache-Control', 'no-store')
      .expect(401);
  });

  it('versions domain calculations and applies validation and problem details', async () => {
    const server = app.getHttpServer();
    await request(server)
      .post('/api/v1/orders/status/transition')
      .send({ currentStatus: 'CREATED', event: { type: 'PAYMENT_APPROVED' } })
      .expect(201)
      .expect({ status: 'CONFIRMED' });
    await request(server)
      .post('/orders/status/transition')
      .send({})
      .expect(404);
    await request(server)
      .post('/api/v1/orders/status/transition')
      .send({ currentStatus: 'UNKNOWN', event: { type: 'PAYMENT_APPROVED' } })
      .expect('Content-Type', /application\/problem\+json/)
      .expect(400);
    await request(server)
      .post('/api/v1/orders/status/transition')
      .send({ currentStatus: 'CANCELLED', event: { type: 'PAYMENT_APPROVED' } })
      .expect(409);
  });

  afterEach(async () => {
    await app.close();
  });
});
