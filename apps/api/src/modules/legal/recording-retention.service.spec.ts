import { Test, TestingModule } from '@nestjs/testing';
import { RecordingRetentionService } from './recording-retention.service';

describe('RecordingRetentionService', () => {
  let service: RecordingRetentionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecordingRetentionService],
    }).compile();

    service = module.get(RecordingRetentionService);
  });

  it('delega o cálculo do prazo para calculateRecordingRetentionExpiresAt', () => {
    const appointmentCompletedAt = new Date('2026-01-01T12:00:00.000Z');

    expect(service.calculateExpiresAt(appointmentCompletedAt)).toEqual(
      new Date('2026-04-01T12:00:00.000Z'),
    );
  });

  it('delega a avaliação de elegibilidade para evaluateRecordingRetentionEligibility', () => {
    const appointmentCompletedAt = new Date('2026-01-01T12:00:00.000Z');
    const now = new Date('2026-04-01T12:00:00.001Z');

    expect(
      service.evaluateEligibility(appointmentCompletedAt, now, false),
    ).toEqual({
      eligibleForDeletion: true,
      reasonCode: 'ELIGIBLE_FOR_DELETION',
    });
  });
});
