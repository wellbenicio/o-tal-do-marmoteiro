import { HttpStatus } from '@nestjs/common';

/**
 * Classe-base para erros de regra de domínio (violação de transição de
 * máquina de estado, entrada logicamente inconsistente com a
 * especificação etc.) — ver ADR 0011
 * (docs/adr/0011-contrato-de-api-e-convencao-rest.md).
 *
 * Todo erro de domínio deve estender esta classe, informando o status
 * HTTP semanticamente correspondente. Isso permite que o
 * `DomainErrorFilter` global traduza qualquer erro de domínio para o
 * formato de erro padrão (RFC 7807) sem exigir um mapeamento manual por
 * tipo de erro — nenhum módulo de domínio precisa conhecer HTTP.
 */
export abstract class DomainError extends Error {
  protected constructor(
    message: string,
    public readonly httpStatus: HttpStatus,
  ) {
    super(message);
  }
}
