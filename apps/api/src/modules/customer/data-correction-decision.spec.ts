import { DataCorrectionRequestStatus } from '@marmoteiro/shared';
import {
  MissingDataCorrectionJustificationError,
  validateDataCorrectionDecision,
} from './data-correction-decision';

describe('validateDataCorrectionDecision', () => {
  it('aceita PENDING sem justificativa (ainda não há decisão)', () => {
    expect(() =>
      validateDataCorrectionDecision({
        status: DataCorrectionRequestStatus.PENDING,
      }),
    ).not.toThrow();
  });

  it('aceita APPROVED sem justificativa (aprovação integral não exige motivo)', () => {
    expect(() =>
      validateDataCorrectionDecision({
        status: DataCorrectionRequestStatus.APPROVED,
      }),
    ).not.toThrow();
  });

  it('rejeita ADJUSTED sem justificativa (seção 6.4)', () => {
    expect(() =>
      validateDataCorrectionDecision({
        status: DataCorrectionRequestStatus.ADJUSTED,
      }),
    ).toThrow(MissingDataCorrectionJustificationError);
  });

  it('rejeita REJECTED sem justificativa (seção 6.4)', () => {
    expect(() =>
      validateDataCorrectionDecision({
        status: DataCorrectionRequestStatus.REJECTED,
      }),
    ).toThrow(MissingDataCorrectionJustificationError);
  });

  it('rejeita ADJUSTED com justificativa vazia/em branco', () => {
    expect(() =>
      validateDataCorrectionDecision({
        status: DataCorrectionRequestStatus.ADJUSTED,
        decisionJustification: '   ',
      }),
    ).toThrow(MissingDataCorrectionJustificationError);
  });

  it('aceita ADJUSTED com justificativa não vazia', () => {
    expect(() =>
      validateDataCorrectionDecision({
        status: DataCorrectionRequestStatus.ADJUSTED,
        decisionJustification:
          'Valor solicitado ajustado por divergência no documento.',
      }),
    ).not.toThrow();
  });

  it('aceita REJECTED com justificativa não vazia', () => {
    expect(() =>
      validateDataCorrectionDecision({
        status: DataCorrectionRequestStatus.REJECTED,
        decisionJustification: 'Documento comprobatório não apresentado.',
      }),
    ).not.toThrow();
  });

  it('lança erro com HTTP 422 (Unprocessable Entity)', () => {
    let caughtError: unknown;
    try {
      validateDataCorrectionDecision({
        status: DataCorrectionRequestStatus.REJECTED,
      });
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError).toBeInstanceOf(MissingDataCorrectionJustificationError);
    expect(
      (caughtError as MissingDataCorrectionJustificationError).httpStatus,
    ).toBe(422);
  });
});
