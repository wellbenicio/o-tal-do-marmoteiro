import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

/**
 * Cliente Prisma como provider Nest. A partir do Prisma 7, a conexão é
 * feita via driver adapter (`@prisma/adapter-pg`) — a URL não é mais lida
 * automaticamente pelo `PrismaClient` a partir do schema.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(configService: ConfigService) {
    const poolMax = Number(configService.get<string>('DATABASE_POOL_MAX') || 3);
    if (!Number.isInteger(poolMax) || poolMax < 1 || poolMax > 20)
      throw new Error('DATABASE_POOL_MAX must be between 1 and 20');
    const adapter = new PrismaPg({
      connectionString: configService.getOrThrow<string>('DATABASE_URL'),
      max: poolMax,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
    });
    super({ adapter });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Conectado ao banco de dados via Prisma');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
