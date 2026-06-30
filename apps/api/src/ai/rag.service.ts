import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { PrismaService } from '../common/prisma/prisma.service';
import { EmbeddingService } from './embedding.service';

@Injectable()
export class RagService {
  private groq: Groq;
  private readonly logger = new Logger(RagService.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private embeddingService: EmbeddingService,
  ) {
    this.groq = new Groq({
      apiKey: this.configService.get('GROQ_API_KEY'),
    });
  }

  async chat(userId: string, courseId: string, sessionId: string | null, message: string) {
    // Get or create session
    let session: any;
    if (sessionId) {
      session = await this.prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: { messages: { orderBy: { createdAt: 'asc' }, take: 20 } },
      });
    }
    if (!session) {
      session = await this.prisma.chatSession.create({
        data: { userId, courseId },
        include: { messages: true },
      });
    }

    // Retrieve relevant context via RAG
    const relevantChunks = await this.embeddingService.searchSimilar(courseId, message, 5);
    const context = relevantChunks.map((c: any) => c.content).join('\n\n');
    const citations = relevantChunks.map((c: any) => ({
      lessonId: c.lesson_id,
      content: c.content.slice(0, 200),
      ...(typeof c.metadata === 'object' ? c.metadata : {}),
    }));

    // If no embeddings yet, fetch lesson content directly as fallback context
    let finalContext = context;
    if (!finalContext.trim()) {
      finalContext = await this.getFallbackContext(courseId);
    }

    // Build conversation history (last 10 messages)
    const history = (session.messages || []).slice(-10).map((m: any) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const systemPrompt = `You are a helpful AI tutor for a specific online course. Your job is to help learners understand the course content.

${finalContext ? `Relevant Course Content:\n${finalContext.slice(0, 4000)}` : 'No course content indexed yet — answer from general knowledge related to the course topic.'}

Guidelines:
- Answer based on the course content when possible
- If a question isn't covered by the course, say so clearly but still try to help
- Keep answers concise and educational
- Use markdown formatting for code or lists`;

    const response = await this.groq.chat.completions.create({
      model: this.configService.get('GROQ_MODEL') || 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: message },
      ],
      temperature: 0.3,
      max_tokens: 1024,
    });

    const assistantMessage = response.choices[0].message.content || '';

    // Persist both messages
    await this.prisma.chatMessage.createMany({
      data: [
        { sessionId: session.id, role: 'user', content: message },
        {
          sessionId: session.id,
          role: 'assistant',
          content: assistantMessage,
          citations: citations.length ? citations : undefined,
        },
      ],
    });

    // Update session updatedAt
    await this.prisma.chatSession.update({
      where: { id: session.id },
      data: { updatedAt: new Date() },
    });

    return {
      sessionId: session.id,
      message: assistantMessage,
      citations,
    };
  }

  async getHistory(sessionId: string) {
    return this.prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getSessions(userId: string, courseId: string) {
    return this.prisma.chatSession.findMany({
      where: { userId, courseId },
      include: { messages: { take: 1, orderBy: { createdAt: 'desc' } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  // Fallback: grab raw lesson content when vectors aren't indexed yet
  private async getFallbackContext(courseId: string): Promise<string> {
    try {
      const course = await this.prisma.course.findUnique({
        where: { id: courseId },
        include: {
          chapters: {
            orderBy: { order: 'asc' },
            take: 2,
            include: { lessons: { orderBy: { order: 'asc' }, take: 3 } },
          },
        },
      });

      const chunks: string[] = [];
      for (const chapter of course?.chapters || []) {
        for (const lesson of chapter.lessons) {
          if (lesson.content) {
            chunks.push(`## ${lesson.title}\n${lesson.content.slice(0, 800)}`);
          }
        }
      }
      return chunks.join('\n\n');
    } catch {
      return '';
    }
  }
}
