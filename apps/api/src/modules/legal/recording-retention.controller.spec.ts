import { Test, TestingModule } from '@nestjs/testing';
import { RecordingRetentionController } from './recording-retention.controller';
import { RecordingRetentionService } from './recording-retention.service';

describe('RecordingRetentionController', () => {
  let controller: RecordingRetentionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecordingRetentionController],
      providers: [RecordingRetentionService],
    }).compile();

    controller = module.get(RecordingRetentionController);
  });

  it('calcula o prazo-limite de retenção', () => {
    const appointmentCompletedAt = new Date('2026-01-01T12:00:00.000Z');

    expect(controller.calculateExpiresAt({ appointmentCompletedAt })).toEqual({
      expiresAt: new Date('2026-04-01T12:00:00.000Z'),
    });
  });

  it('avalia a elegibilidade de exclusão', () => {
    const appointmentCompletedAt = new Date('2026-01-01T12:00:00.000Z');
    const now = new Date('2026-04-01T12:00:00.001Z');

    expect(
      controller.evaluateEligibility({
        appointmentCompletedAt,
        now,
        legalHoldActive: false,
      }),
    ).toEqual({
      eligibleForDeletion: true,
      reasonCode: 'ELIGIBLE_FOR_DELETION',
    });
  });
});
