import { NestFactory } from '@nestjs/core';
import express from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  app.use(express.json({ limit: '16kb' }));
  app.use(
    (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      if (req.path.startsWith('/admin') || req.path.startsWith('/internal'))
        res.setHeader('Cache-Control', 'no-store');
      next();
    },
  );
  app.enableShutdownHooks();
  await app.listen(process.env.PORT ?? 3001, process.env.HOST ?? '127.0.0.1');
}
void bootstrap();
