import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  AdminSessionGuard,
  InternalApiGuard,
} from '../identity/admin/admin-auth.guard';
import { AppointmentCommunicationsService } from './appointment-communications.service';
@Controller('admin/integrations')
@UseGuards(InternalApiGuard, AdminSessionGuard)
export class NotificationController {
  constructor(
    private readonly communications: AppointmentCommunicationsService,
  ) {}
  @Get('status') status() {
    return this.communications.readiness();
  }
}
