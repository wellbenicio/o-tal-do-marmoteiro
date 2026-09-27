import { Test, TestingModule } from '@nestjs/testing';
import { DataCorrectionRequestStatus } from '@marmoteiro/shared';
import { DataCorrectionDecisionController } from './data-correction-decision.controller';
import { DataCorrectionDecisionService } from './data-correction-decision.service';
import { MissingDataCorrectionJustificationError } from './data-correction-decision';

describe('DataCorrectionDecisionController', () => {
  let controller: DataCorrectionDecisionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataCorrectionDecisionController],
      providers: [DataCorrectionDecisionService],
    }).compile();

    controller = module.get(DataCorrectionDecisionController);
  });

  it('confirma validade quando a decisão é bem formada', () => {
    expect(
      controller.validate({ status: DataCorrectionRequestStatus.APPROVED }),
    ).toEqual({ valid: true });
  });

  it('propaga o erro quando a justificativa exigida está ausente', () => {
    expect(() =>
      controller.validate({ status: DataCorrectionRequestStatus.ADJUSTED }),
    ).toThrow(MissingDataCorrectionJustificationError);
  });
});
