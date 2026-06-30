import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

const COURSE_INCLUDE = {
  creator: { select: { id: true, name: true, avatarUrl: true } },
  tags: { include: { tag: true } },
  chapters: {
    orderBy: { order: 'asc' as const },
    include: {
      lessons: { orderBy: { order: 'asc' as const } },
    },
  },
  _count: { select: { likes: true, forkRecords: true, bookmarks: true } },
};

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateCourseDto) {
    const { tags, ...data } = dto;
    return this.prisma.course.create({
      data: {
        ...data,
        creatorId: userId,
        tags: tags?.length
          ? {
              create: await this.resolveTagIds(tags),
            }
          : undefined,
      },
      include: COURSE_INCLUDE,
    });
  }

  async findAll(userId?: string) {
    return this.prisma.course.findMany({
      where: { status: 'PUBLISHED' },
      include: COURSE_INCLUDE,
      orderBy: { publishedAt: 'desc' },
    });
  }

  async findMyCourses(userId: string) {
    return this.prisma.course.findMany({
      where: { creatorId: userId },
      include: COURSE_INCLUDE,
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: COURSE_INCLUDE,
    });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async update(id: string, userId: string, dto: UpdateCourseDto) {
    const course = await this.findOne(id);
    if (course.creatorId !== userId) throw new ForbiddenException('Not your course');

    const { tags, ...data } = dto;

    // Save version before update
    await this.prisma.courseVersion.create({
      data: {
        courseId: id,
        version: new Date().toISOString(),
        snapshot: course as any,
        createdBy: userId,
        changelog: 'Manual update',
      },
    });

    return this.prisma.course.update({
      where: { id },
      data: {
        ...data,
        tags: tags
          ? {
              deleteMany: {},
              create: await this.resolveTagIds(tags),
            }
          : undefined,
      },
      include: COURSE_INCLUDE,
    });
  }

  async publish(id: string, userId: string) {
    const course = await this.findOne(id);
    if (course.creatorId !== userId) throw new ForbiddenException('Not your course');

    return this.prisma.course.update({
      where: { id },
      data: { status: 'PUBLISHED', publishedAt: new Date() },
      include: COURSE_INCLUDE,
    });
  }

  async delete(id: string, userId: string) {
    const course = await this.findOne(id);
    if (course.creatorId !== userId) throw new ForbiddenException('Not your course');
    await this.prisma.course.delete({ where: { id } });
    return { message: 'Course deleted' };
  }

  async fork(courseId: string, userId: string) {
    const original = await this.findOne(courseId);
    if (original.status !== 'PUBLISHED') throw new ForbiddenException('Can only fork published courses');

    // Deep copy the course
    const forked = await this.prisma.course.create({
      data: {
        title: `${original.title} (Fork)`,
        description: original.description,
        coverImageUrl: original.coverImageUrl,
        difficulty: original.difficulty,
        estimatedHours: original.estimatedHours,
        isForked: true,
        originalCourseId: courseId,
        creatorId: userId,
        tags: {
          create: (original.tags as any[]).map((ct: any) => ({ tagId: ct.tagId })),
        },
        chapters: {
          create: (original.chapters as any[]).map((ch: any, ci: number) => ({
            title: ch.title,
            description: ch.description,
            order: ch.order,
            lessons: {
              create: ch.lessons.map((l: any, li: number) => ({
                title: l.title,
                content: l.content,
                order: l.order,
                duration: l.duration,
              })),
            },
          })),
        },
      },
      include: COURSE_INCLUDE,
    });

    await this.prisma.fork.create({
      data: { userId, originalCourseId: courseId, forkedCourseId: forked.id },
    });

    return forked;
  }

  async getVersions(courseId: string) {
    return this.prisma.courseVersion.findMany({
      where: { courseId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async toggleBookmark(userId: string, courseId: string) {
    const existing = await this.prisma.bookmark.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (existing) {
      await this.prisma.bookmark.delete({ where: { userId_courseId: { userId, courseId } } });
      return { bookmarked: false };
    }

    await this.prisma.bookmark.create({ data: { userId, courseId } });
    return { bookmarked: true };
  }

  async toggleLike(userId: string, courseId: string) {
    const existing = await this.prisma.like.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (existing) {
      await this.prisma.like.delete({ where: { userId_courseId: { userId, courseId } } });
      return { liked: false };
    }

    await this.prisma.like.create({ data: { userId, courseId } });
    return { liked: true };
  }

  private async resolveTagIds(tagNames: string[]) {
    const tags = await Promise.all(
      tagNames.map(async (name) => {
        const slug = name.toLowerCase().replace(/\s+/g, '-');
        const tag = await this.prisma.tag.upsert({
          where: { slug },
          update: {},
          create: { name, slug },
        });
        return { tagId: tag.id };
      }),
    );
    return tags;
  }
}
