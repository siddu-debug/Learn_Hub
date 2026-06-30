import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import * as pdfParse from 'pdf-parse';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { PrismaService } from '../common/prisma/prisma.service';
import { EmbeddingService } from './embedding.service';
import { GenerateCourseDto } from './dto/generate-course.dto';

@Injectable()
export class AiService {
  private groq: Groq;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private embeddingService: EmbeddingService,
  ) {
    this.groq = new Groq({
      apiKey: this.configService.get('GROQ_API_KEY'),
    });
  }

  async generateFromPrompt(userId: string, dto: GenerateCourseDto) {
    let sourceContent = dto.prompt || '';

    if (dto.type === 'pdf' && dto.content) {
      sourceContent = dto.content;
    } else if (dto.type === 'url' && dto.url) {
      sourceContent = await this.extractFromUrl(dto.url);
    } else if (dto.type === 'github' && dto.url) {
      sourceContent = await this.extractFromGithub(dto.url);
    }

    const courseStructure = await this.generateCourseStructure(sourceContent, dto.topic);
    const course = await this.createCourseFromStructure(userId, courseStructure);

    // Embed asynchronously — don't block the response
    this.embeddingService.embedCourse(course.id).catch(console.error);

    return course;
  }

  private async extractFromUrl(url: string): Promise<string> {
    try {
      const { data } = await axios.get(url, { timeout: 10000 });
      const $ = cheerio.load(data);
      $('script, style, nav, footer, header').remove();
      return $('body').text().replace(/\s+/g, ' ').trim().slice(0, 8000);
    } catch {
      throw new BadRequestException('Could not fetch URL content');
    }
  }

  private async extractFromGithub(url: string): Promise<string> {
    try {
      const repoPath = url.replace('https://github.com/', '');
      const readmeUrl = `https://raw.githubusercontent.com/${repoPath}/main/README.md`;
      const { data } = await axios.get(readmeUrl, { timeout: 10000 });
      return data.slice(0, 8000);
    } catch {
      throw new BadRequestException('Could not fetch GitHub README');
    }
  }

  private async generateCourseStructure(content: string, topic?: string) {
    const prompt = `You are an expert course designer. Create a comprehensive course structure.

${topic ? `Topic: ${topic}` : ''}
${content ? `Source Content:\n${content.slice(0, 6000)}` : ''}

Return ONLY valid JSON in this exact format (no markdown, no backticks, raw JSON only):
{
  "title": "Course Title",
  "description": "Course description (2-3 sentences)",
  "difficulty": "BEGINNER",
  "estimatedHours": 10,
  "tags": ["tag1", "tag2", "tag3"],
  "chapters": [
    {
      "title": "Chapter Title",
      "description": "Chapter overview",
      "lessons": [
        {
          "title": "Lesson Title",
          "content": "Full markdown lesson content (300-500 words with headings, examples)",
          "duration": 15,
          "quiz": {
            "title": "Quiz Title",
            "questions": [
              {
                "text": "Question text?",
                "explanation": "Why this answer is correct",
                "answers": [
                  {"text": "Correct answer", "isCorrect": true},
                  {"text": "Wrong answer 1", "isCorrect": false},
                  {"text": "Wrong answer 2", "isCorrect": false},
                  {"text": "Wrong answer 3", "isCorrect": false}
                ]
              }
            ]
          }
        }
      ]
    }
  ]
}

Rules:
- difficulty must be exactly one of: BEGINNER, INTERMEDIATE, ADVANCED
- Generate 3-5 chapters with 2-4 lessons each
- Each lesson must have exactly 1 quiz with 3-5 questions
- Return raw JSON only, no markdown fences`;

    const response = await this.groq.chat.completions.create({
      model: this.configService.get('GROQ_MODEL') || 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 8000,
    });

    const raw = response.choices[0].message.content || '{}';

    // Strip markdown fences if model wraps in ```json ... ```
    const cleaned = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    try {
      return JSON.parse(cleaned);
    } catch {
      // Try to extract JSON object from the response
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
      throw new BadRequestException('AI returned invalid JSON. Please try again.');
    }
  }

  private async createCourseFromStructure(userId: string, structure: any) {
    const { chapters, tags, ...courseData } = structure;

    // Ensure difficulty is valid enum value
    const validDifficulties = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
    if (!validDifficulties.includes(courseData.difficulty)) {
      courseData.difficulty = 'BEGINNER';
    }

    const course = await this.prisma.course.create({
      data: {
        ...courseData,
        creatorId: userId,
        tags: tags?.length
          ? {
              create: await Promise.all(
                tags.map(async (name: string) => {
                  const slug = name.toLowerCase().replace(/\s+/g, '-');
                  const tag = await this.prisma.tag.upsert({
                    where: { slug },
                    update: {},
                    create: { name, slug },
                  });
                  return { tagId: tag.id };
                }),
              ),
            }
          : undefined,
      },
    });

    for (let ci = 0; ci < (chapters || []).length; ci++) {
      const { lessons, ...chapterData } = chapters[ci];
      const chapter = await this.prisma.chapter.create({
        data: { ...chapterData, courseId: course.id, order: ci + 1 },
      });

      for (let li = 0; li < (lessons || []).length; li++) {
        const { quiz, ...lessonData } = lessons[li];
        const lesson = await this.prisma.lesson.create({
          data: { ...lessonData, chapterId: chapter.id, order: li + 1 },
        });

        if (quiz?.questions?.length) {
          const quizRecord = await this.prisma.quiz.create({
            data: { lessonId: lesson.id, title: quiz.title, passMark: 70 },
          });

          for (let qi = 0; qi < quiz.questions.length; qi++) {
            const { answers, ...questionData } = quiz.questions[qi];
            const question = await this.prisma.question.create({
              data: { ...questionData, quizId: quizRecord.id, order: qi + 1 },
            });

            for (let ai = 0; ai < (answers || []).length; ai++) {
              await this.prisma.answer.create({
                data: { ...answers[ai], questionId: question.id, order: ai + 1 },
              });
            }
          }
        }
      }
    }

    return this.prisma.course.findUnique({
      where: { id: course.id },
      include: {
        creator: { select: { id: true, name: true, avatarUrl: true } },
        tags: { include: { tag: true } },
        chapters: { include: { lessons: { include: { quizzes: true } } } },
      },
    });
  }
}
