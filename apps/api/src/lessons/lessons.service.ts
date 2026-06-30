import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  private async checkChapterOwner(chapterId: string, userId: string) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { course: true },
    });
    if (!chapter) throw new NotFoundException('Chapter not found');
    if (chapter.course.creatorId !== userId) throw new ForbiddenException('Not authorized');
    return chapter;
  }

  async create(chapterId: string, userId: string, data: any) {
    await this.checkChapterOwner(chapterId, userId);
    const count = await this.prisma.lesson.count({ where: { chapterId } });
    return this.prisma.lesson.create({
      data: { chapterId, ...data, order: count + 1 },
    });
  }

  async findOne(id: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: { quizzes: { include: { questions: { include: { answers: true } } } } },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');
    return lesson;
  }

  async update(id: string, userId: string, data: any) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: { chapter: { include: { course: true } } },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');
    if (lesson.chapter.course.creatorId !== userId) throw new ForbiddenException();
    return this.prisma.lesson.update({ where: { id }, data });
  }

  async delete(id: string, userId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: { chapter: { include: { course: true } } },
    });
    if (!lesson) throw new NotFoundException();
    if (lesson.chapter.course.creatorId !== userId) throw new ForbiddenException();
    await this.prisma.lesson.delete({ where: { id } });
    return { message: 'Lesson deleted' };
  }

  async completeLesson(userId: string, lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { chapter: { include: { course: true } } },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');

    await this.prisma.lessonCompletion.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: {},
      create: { userId, lessonId },
    });

    // Update progress
    const courseId = lesson.chapter.courseId;
    const totalLessons = await this.prisma.lesson.count({
      where: { chapter: { courseId } },
    });
    const completedLessons = await this.prisma.lessonCompletion.count({
      where: { userId, lesson: { chapter: { courseId } } },
    });
    const percentage = (completedLessons / totalLessons) * 100;

    await this.prisma.progress.upsert({
      where: { userId_courseId: { userId, courseId } },
      update: {
        completedLessons,
        totalLessons,
        percentage,
        lastAccessedAt: new Date(),
        completedAt: percentage === 100 ? new Date() : null,
      },
      create: { userId, courseId, completedLessons, totalLessons, percentage },
    });

    return { completed: true, percentage };
  }
}
