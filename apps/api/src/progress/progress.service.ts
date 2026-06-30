import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  async getMyProgress(userId: string) {
    return this.prisma.progress.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            creator: { select: { id: true, name: true, avatarUrl: true } },
            _count: { select: { likes: true } },
          },
        },
      },
      orderBy: { lastAccessedAt: 'desc' },
    });
  }

  async getCourseProgress(userId: string, courseId: string) {
    const progress = await this.prisma.progress.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    const completedLessons = await this.prisma.lessonCompletion.findMany({
      where: { userId, lesson: { chapter: { courseId } } },
      select: { lessonId: true },
    });

    return {
      progress,
      completedLessonIds: completedLessons.map((c) => c.lessonId),
    };
  }

  async getDashboardStats(userId: string) {
    const [enrolledCourses, completedCourses, totalLessonsCompleted, quizzesPassed] = await Promise.all([
      this.prisma.progress.count({ where: { userId } }),
      this.prisma.progress.count({ where: { userId, completedAt: { not: null } } }),
      this.prisma.lessonCompletion.count({ where: { userId } }),
      this.prisma.quizAttempt.count({ where: { userId, passed: true } }),
    ]);

    const recentActivity = await this.prisma.progress.findMany({
      where: { userId },
      include: {
        course: { select: { id: true, title: true, coverImageUrl: true } },
      },
      orderBy: { lastAccessedAt: 'desc' },
      take: 5,
    });

    return { enrolledCourses, completedCourses, totalLessonsCompleted, quizzesPassed, recentActivity };
  }
}
