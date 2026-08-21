import { Module } from '@nestjs/common';

/**
 * Domínio: Scheduling (agenda da consulta online).
 * Fonte: especificação funcional, seções 14 (Consulta online) e
 * 15 (Reagendamento da consulta). Máquina de estado do Atendimento
 * (`AppointmentStatus`) e da solicitação de reagendamento
 * (`RescheduleRequestStatus`) definidas em
 * docs/adr/0003-maquina-de-estado-do-atendimento.md.
 */
@Module({})
export class SchedulingModule {}
