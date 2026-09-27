import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { IdentityModule } from './modules/identity/identity.module';
import { CustomerModule } from './modules/customer/customer.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { OrderingModule } from './modules/ordering/ordering.module';
import { PaymentModule } from './modules/payment/payment.module';
import { SchedulingModule } from './modules/scheduling/scheduling.module';
import { QuestionModule } from './modules/question/question.module';
import { FulfillmentModule } from './modules/fulfillment/fulfillment.module';
import { CancellationModule } from './modules/cancellation/cancellation.module';
import { LegalModule } from './modules/legal/legal.module';
import { PrivacyModule } from './modules/privacy/privacy.module';
import { NotificationModule } from './modules/notification/notification.module';
import { AdministrationModule } from './modules/administration/administration.module';
import { AuditModule } from './modules/audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    IdentityModule,
    CustomerModule,
    CatalogModule,
    OrderingModule,
    PaymentModule,
    SchedulingModule,
    QuestionModule,
    FulfillmentModule,
    CancellationModule,
    LegalModule,
    PrivacyModule,
    NotificationModule,
    AdministrationModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
