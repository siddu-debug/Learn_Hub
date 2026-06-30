import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class ChaptersService {
  constructor(private prisma: PrismaService) {}

  private async checkCourseOwner(courseId: string, userId: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');
    if (course.creatorId !== userId) throw new ForbiddenException('Not your course');
    return course;
  }

  async create(courseId: string, userId: string, data: { title: string; description?: string }) {
    await this.checkCourseOwner(courseId, userId);
    const count = await this.prisma.chapter.count({ where: { courseId } });
    return this.prisma.chapter.create({
      data: { courseId, ...data, order: count + 1 },
      include: { lessons: true },
    });
  }

  async update(id: string, userId: string, data: { title?: string; description?: string }) {
    const chapter = await this.prisma.chapter.findUnique({ where: { id }, include: { course: true } });
    if (!chapter) throw new NotFoundException('Chapter not found');
    if (chapter.course.creatorId !== userId) throw new ForbiddenException();
    return this.prisma.chapter.update({ where: { id }, data, include: { lessons: true } });
  }

  async delete(id: string, userId: string) {
    const chapter = await this.prisma.chapter.findUnique({ where: { id }, include: { course: true } });
    if (!chapter) throw new NotFoundException('Chapter not found');
    if (chapter.course.creatorId !== userId) throw new ForbiddenException();
    await this.prisma.chapter.delete({ where: { id } });
    return { message: 'Chapter deleted' };
  }

  async reorder(courseId: string, userId: string, chapterIds: string[]) {
    await this.checkCourseOwner(courseId, userId);
    await Promise.all(
      chapterIds.map((id, index) =>
        this.prisma.chapter.update({ where: { id }, data: { order: index + 1 } }),
      ),
    );
    return { message: 'Reordered' };
  }
}
