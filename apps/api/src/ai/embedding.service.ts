import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from '../common/prisma/prisma.service';

// HuggingFace free inference API — BAAI/bge-small-en-v1.5 produces 384-dim vectors
// Get free API key at: https://huggingface.co/settings/tokens
const HF_MODEL = 'BAAI/bge-small-en-v1.5';
const EMBEDDING_DIM = 384;

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private hfApiKey: string;

  constructor(private configService: ConfigService, private prisma: PrismaService) {
    this.hfApiKey = this.configService.get('HUGGINGFACE_API_KEY') || '';
  }

  async embedCourse(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { chapters: { include: { lessons: true } } },
    });
    if (!course) return;

    await this.prisma.courseEmbedding.deleteMany({ where: { courseId } });

    for (const chapter of course.chapters) {
      for (const lesson of chapter.lessons) {
        if (!lesson.content) continue;

        try {
          const chunks = this.chunkText(lesson.content, 200);
          for (const chunk of chunks) {
            const embedding = await this.createEmbedding(chunk);

            await this.prisma.$executeRaw`
              INSERT INTO course_embeddings (id, course_id, lesson_id, content, embedding, metadata, created_at)
              VALUES (
                gen_random_uuid(),
                ${courseId},
                ${lesson.id},
                ${chunk},
                ${JSON.stringify(embedding)}::vector,
                ${JSON.stringify({ lessonTitle: lesson.title, chapterTitle: chapter.title })}::jsonb,
                NOW()
              )
            `;
          }
        } catch (err) {
          // Embedding is best-effort — don't fail course creation
          this.logger.warn(`Failed to embed lesson ${lesson.id}: ${err.message}`);
        }
      }
    }
  }

  async searchSimilar(courseId: string, query: string, limit = 5) {
    try {
      const queryEmbedding = await this.createEmbedding(query);

      const results = await this.prisma.$queryRaw<any[]>`
        SELECT
          ce.id,
          ce.content,
          ce.lesson_id,
          ce.metadata,
          1 - (ce.embedding <=> ${JSON.stringify(queryEmbedding)}::vector) as similarity
        FROM course_embeddings ce
        WHERE ce.course_id = ${courseId}
        ORDER BY ce.embedding <=> ${JSON.stringify(queryEmbedding)}::vector
        LIMIT ${limit}
      `;

      return results;
    } catch (err) {
      this.logger.warn(`Vector search failed, falling back to text search: ${err.message}`);
      return this.fallbackTextSearch(courseId, query, limit);
    }
  }

  async createEmbedding(text: string): Promise<number[]> {
    if (!this.hfApiKey) {
      // Return zero vector if no API key — RAG will degrade gracefully to text fallback
      this.logger.warn('HUGGINGFACE_API_KEY not set — using zero vector. Set it for proper RAG.');
      return new Array(EMBEDDING_DIM).fill(0);
    }

    const response = await axios.post(
      `https://api-inference.huggingface.co/pipeline/feature-extraction/${HF_MODEL}`,
      { inputs: text.slice(0, 2000), options: { wait_for_model: true } },
      {
        headers: { Authorization: `Bearer ${this.hfApiKey}` },
        timeout: 30000,
      },
    );

    // HF returns nested array for batch — unwrap if needed
    const data = response.data;
    if (Array.isArray(data[0])) return data[0] as number[];
    return data as number[];
  }

  // Fallback: simple keyword search when embeddings aren't available
  private async fallbackTextSearch(courseId: string, query: string, limit: number) {
    const results = await this.prisma.courseEmbedding.findMany({
      where: {
        courseId,
        content: { contains: query.split(' ').slice(0, 3).join(' '), mode: 'insensitive' },
      },
      take: limit,
    });

    return results.map(r => ({
      id: r.id,
      content: r.content,
      lesson_id: r.lessonId,
      metadata: r.metadata,
      similarity: 0.5,
    }));
  }

  private chunkText(text: string, chunkSize: number): string[] {
    const words = text.split(' ');
    const chunks: string[] = [];
    let current: string[] = [];

    for (const word of words) {
      current.push(word);
      if (current.length >= chunkSize) {
        chunks.push(current.join(' '));
        current = current.slice(-30); // 30-word overlap
      }
    }
    if (current.length > 10) chunks.push(current.join(' '));
    return chunks;
  }
}
