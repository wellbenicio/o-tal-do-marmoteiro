import { Module } from '@nestjs/common';
import { AppointmentStatusService } from './appointment-status.service';
import { RescheduleRequestStatusService } from './reschedule-request-status.service';
import { AppointmentSlotStatusService } from './appointment-slot-status.service';

/**
 * Domínio: Scheduling (agenda da consulta online).
 * Fonte: especificação funcional, seções 14 (Consulta online) e
 * 15 (Reagendamento da consulta). Máquina de estado do Atendimento
 * (`AppointmentStatus`) e da solicitação de reagendamento
 * (`RescheduleRequestStatus`) definidas em
 * docs/adr/0003-maquina-de-estado-do-atendimento.md. Máquina de estado do
 * Slot de Agenda (`AppointmentSlotStatus`) definida em
 * docs/adr/0005-maquina-de-estado-do-slot-de-agenda.md.
 */
@Module({
  providers: [
    AppointmentStatusService,
    RescheduleRequestStatusService,
    AppointmentSlotStatusService,
  ],
  exports: [
    AppointmentStatusService,
    RescheduleRequestStatusService,
    AppointmentSlotStatusService,
  ],
})
export class SchedulingModule {}
