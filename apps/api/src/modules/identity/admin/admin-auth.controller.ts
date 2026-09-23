import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  Header,
  HttpCode,
} from '@nestjs/common';
import type { Request } from 'express';
import { AdminAuthService } from './admin-auth.service';
import {
  AdminSessionGuard,
  InternalApiGuard,
  bearer,
  type AdminRequest,
} from './admin-auth.guard';
@Controller('admin/auth')
@UseGuards(InternalApiGuard)
export class AdminAuthController {
  constructor(private readonly auth: AdminAuthService) {}
  @Post('login')
  @HttpCode(200)
  login(
    @Body() body: { email?: unknown; password?: unknown },
    @Req() req: Request,
  ) {
    return this.auth.login(
      body?.email,
      body?.password,
      req.header('x-admin-client-key') || 'shared',
    );
  }
  @Get('session')
  @Header('Cache-Control', 'no-store')
  @UseGuards(AdminSessionGuard)
  session(@Req() req: AdminRequest) {
    return req.admin;
  }
  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req: Request) {
    await this.auth.logout(bearer(req));
    return { ok: true };
  }
}
