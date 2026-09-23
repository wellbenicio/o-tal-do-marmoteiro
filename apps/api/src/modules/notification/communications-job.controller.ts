import {
  CanActivate,
  Controller,
  ExecutionContext,
  HttpCode,
  Injectable,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { equalSecret } from '../identity/admin/credentials';
import { AppointmentCommunicationsService } from './appointment-communications.service';

@Injectable()
export class CommunicationsJobGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}
  canActivate(context: ExecutionContext) {
    const expected = this.config.get<string>('OUTBOX_TRIGGER_SECRET');
    const actual =
      context.switchToHttp().getRequest<Request>().header('x-outbox-secret') ||
      '';
    if (!expected || expected.length < 32 || !equalSecret(expected, actual))
      throw new UnauthorizedException();
    return true;
  }
}

@Controller('internal/jobs/communications')
@UseGuards(CommunicationsJobGuard)
export class CommunicationsJobController {
  constructor(
    private readonly communications: AppointmentCommunicationsService,
  ) {}

  @Post()
  @HttpCode(200)
  async run() {
    // Await the entire bounded batch: request-based runtimes may suspend CPU
    // as soon as the response ends. Neither a browser nor a timer owns this job.
    return await this.communications.processDue();
  }
}
