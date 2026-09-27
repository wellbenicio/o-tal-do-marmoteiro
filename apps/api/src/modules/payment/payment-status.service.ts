import { Injectable } from '@nestjs/common';
import { PaymentStatus } from '@marmoteiro/shared';
import {
  PaymentStatusEvent,
  canTransitionPaymentStatus,
  transitionPaymentStatus,
} from './payment-status.machine';

/**
 * Ponto único de acesso à máquina de estado do Pagamento para o restante da
 * aplicação (ex.: módulos `ordering`, `scheduling` e `cancellation`
 * reagindo a eventos financeiros). Ver
 * docs/adr/0004-maquina-de-estado-do-pagamento.md.
 */
@Injectable()
export class PaymentStatusService {
  canTransition(
    currentStatus: PaymentStatus,
    event: PaymentStatusEvent,
  ): boolean {
    return canTransitionPaymentStatus(currentStatus, event);
  }

  transition(
    currentStatus: PaymentStatus,
    event: PaymentStatusEvent,
  ): PaymentStatus {
    return transitionPaymentStatus(currentStatus, event);
  }
}
