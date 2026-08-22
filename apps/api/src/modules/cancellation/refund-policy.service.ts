import { Injectable } from '@nestjs/common';
import {
  RefundPolicyInput,
  RefundPolicyDecision,
  evaluateRefundPolicy,
} from './refund-policy';

/**
 * Ponto único de acesso ao Refund Policy Engine para o restante da
 * aplicação (ex.: módulos `ordering`, `scheduling`, `question` e `payment`
 * reagindo a solicitações de cancelamento). Ver
 * docs/adr/0007-motor-de-politica-de-reembolso.md.
 */
@Injectable()
export class RefundPolicyService {
  evaluate(input: RefundPolicyInput): RefundPolicyDecision {
    return evaluateRefundPolicy(input);
  }
}
