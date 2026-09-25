import { Test, TestingModule } from '@nestjs/testing';
import { DataCorrectionRequestStatus } from '@marmoteiro/shared';
import { DataCorrectionDecisionService } from './data-correction-decision.service';
import { MissingDataCorrectionJustificationError } from './data-correction-decision';

describe('DataCorrectionDecisionService', () => {
  let service: DataCorrectionDecisionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DataCorrectionDecisionService],
    }).compile();

    service = module.get(DataCorrectionDecisionService);
  });

  it('delega a validação para validateDataCorrectionDecision', () => {
    expect(() =>
      service.validateDecision({
        status: DataCorrectionRequestStatus.APPROVED,
      }),
    ).not.toThrow();
  });

  it('propaga o erro de justificativa ausente', () => {
    expect(() =>
      service.validateDecision({
        status: DataCorrectionRequestStatus.REJECTED,
      }),
    ).toThrow(MissingDataCorrectionJustificationError);
  });
});
