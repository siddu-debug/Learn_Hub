import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [totalUsers, totalCourses, publishedCourses, totalLessons] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.course.count(),
      this.prisma.course.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.lesson.count(),
    ]);
    return { totalUsers, totalCourses, publishedCourses, totalLessons };
  }

  async getUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);
    return { users, total, page, limit };
  }

  async toggleUserActive(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: !user?.isActive },
    });
  }

  async getCourses(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        skip,
        take: limit,
        include: {
          creator: { select: { id: true, name: true, email: true } },
          _count: { select: { likes: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.course.count(),
    ]);
    return { courses, total, page, limit };
  }

  async archiveCourse(courseId: string) {
    return this.prisma.course.update({
      where: { id: courseId },
      data: { status: 'ARCHIVED' },
    });
  }
}
