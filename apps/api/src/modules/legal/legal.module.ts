import { Module } from '@nestjs/common';
import { RecordingRetentionService } from './recording-retention.service';
import { RecordingRetentionController } from './recording-retention.controller';

/**
 * Domínio: Legal (documentos jurídicos, aceite eletrônico e gravação).
 * Fonte: especificação funcional, seções 8 (Documentos jurídicos e aceite
 * eletrônico) e 26 (Gravação de consultas). Retenção de gravação e legal
 * hold definidos em docs/adr/0014-retencao-de-gravacao-e-legal-hold.md.
 * Controllers HTTP finos conforme ADR 0011.
 */
@Module({
  controllers: [RecordingRetentionController],
  providers: [RecordingRetentionService],
  exports: [RecordingRetentionService],
})
export class LegalModule {}
