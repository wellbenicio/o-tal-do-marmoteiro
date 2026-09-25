import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { STATUS_CODES } from 'node:http';
import { DomainError } from '../errors/domain-error';

/**
 * Corpo de erro padrão da API — "Problem Details for HTTP APIs" (RFC 7807),
 * ver ADR 0011 (docs/adr/0011-contrato-de-api-e-convencao-rest.md).
 */
export interface ProblemDetails {
  /** URI identificando o tipo do problema. Sem catálogo próprio ainda, usa "about:blank" (default do RFC 7807). */
  type: string;
  /** Resumo curto e legível do tipo do problema (não deve variar por ocorrência). */
  title: string;
  /** Status HTTP repetido no corpo, por conveniência do cliente. */
  status: number;
  /** Explicação específica desta ocorrência do problema. */
  detail: string;
  /** Código estável e legível por máquina (ex.: nome da classe do erro de domínio) para tratamento programático pelo cliente. */
  code: string;
  /** URI identificando esta ocorrência específica do problema (aqui, o path da requisição). */
  instance: string;
}

/**
 * Filtro de exceção global — traduz qualquer exceção lançada durante o
 * processamento de uma requisição HTTP para o formato `ProblemDetails`
 * (RFC 7807), conforme ADR 0011. Cobre três casos:
 *
 * 1. `DomainError` (e subclasses) — erros de regra de negócio dos módulos
 *    de domínio; usa o `httpStatus` que a própria classe já carrega.
 * 2. `HttpException` do NestJS (inclui `BadRequestException` lançada pelo
 *    `ValidationPipe` global) — usa o status/mensagem já existentes.
 * 3. Qualquer outro erro não previsto — responde 500 genérico ao cliente
 *    (sem vazar detalhes internos) e loga o erro real no servidor.
 */
@Catch()
export class DomainErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainErrorFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, detail, code } = this.resolve(exception);

    const problem: ProblemDetails = {
      type: 'about:blank',
      title: STATUS_CODES[status] ?? 'Error',
      status,
      detail,
      code,
      instance: request.originalUrl ?? request.url,
    };

    response
      .status(status)
      .setHeader('Content-Type', 'application/problem+json')
      .json(problem);
  }

  private resolve(exception: unknown): {
    status: number;
    detail: string;
    code: string;
  } {
    if (exception instanceof DomainError) {
      return {
        status: exception.httpStatus,
        detail: exception.message,
        code: exception.name,
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      const detail =
        typeof response === 'string'
          ? response
          : ((response as { message?: string | string[] }).message ??
            exception.message);
      return {
        status,
        detail: Array.isArray(detail) ? detail.join('; ') : detail,
        code: exception.name,
      };
    }

    this.logger.error(
      'Erro não tratado ao processar requisição',
      exception instanceof Error ? exception.stack : String(exception),
    );

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      detail: 'Erro interno inesperado.',
      code: 'InternalServerError',
    };
  }
}
