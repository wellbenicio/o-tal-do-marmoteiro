import { Module } from '@nestjs/common';
import { AppointmentStatusService } from './appointment-status.service';
import { RescheduleRequestStatusService } from './reschedule-request-status.service';

/**
 * Domínio: Scheduling (agenda da consulta online).
 * Fonte: especificação funcional, seções 14 (Consulta online) e
 * 15 (Reagendamento da consulta). Máquina de estado do Atendimento
 * (`AppointmentStatus`) e da solicitação de reagendamento
 * (`RescheduleRequestStatus`) definidas em
 * docs/adr/0003-maquina-de-estado-do-atendimento.md.
 */
@Module({
  providers: [AppointmentStatusService, RescheduleRequestStatusService],
  exports: [AppointmentStatusService, RescheduleRequestStatusService],
})
export class SchedulingModule {}
