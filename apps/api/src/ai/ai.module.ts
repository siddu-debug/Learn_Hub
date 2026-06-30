import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { EmbeddingService } from './embedding.service';
import { RagService } from './rag.service';

@Module({
  controllers: [AiController],
  providers: [AiService, EmbeddingService, RagService],
  exports: [AiService, EmbeddingService, RagService],
})
export class AiModule {}
