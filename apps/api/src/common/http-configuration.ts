import {
  INestApplication,
  RequestMethod,
  ValidationPipe,
} from '@nestjs/common';
import express from 'express';
import { DomainErrorFilter } from './filters/domain-error.filter';

export function configureHttp(app: INestApplication) {
  app.setGlobalPrefix('api/v1', {
    exclude: [
      { path: '/', method: RequestMethod.GET },
      { path: 'admin/{*path}', method: RequestMethod.ALL },
      { path: 'internal/{*path}', method: RequestMethod.ALL },
    ],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new DomainErrorFilter());
  app.use(express.json({ limit: '16kb' }));
  app.use(
    (
      request: express.Request,
      response: express.Response,
      next: express.NextFunction,
    ) => {
      if (
        request.path.startsWith('/admin') ||
        request.path.startsWith('/internal')
      )
        response.setHeader('Cache-Control', 'no-store');
      next();
    },
  );
}
