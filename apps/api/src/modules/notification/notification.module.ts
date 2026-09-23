import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { GoogleCalendarGateway } from './providers/google-calendar';
import { WhatsAppGateway } from './providers/whatsapp';
import { AppointmentCommunicationsService } from './appointment-communications.service';
import { NotificationController } from './notification.controller';
import {
  CommunicationsJobController,
  CommunicationsJobGuard,
} from './communications-job.controller';
@Module({
  imports: [IdentityModule],
  providers: [
    GoogleCalendarGateway,
    WhatsAppGateway,
    AppointmentCommunicationsService,
    CommunicationsJobGuard,
  ],
  controllers: [NotificationController, CommunicationsJobController],
  exports: [AppointmentCommunicationsService],
})
export class NotificationModule {}
