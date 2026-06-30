import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(query: string, filters?: { tag?: string; difficulty?: string; creatorId?: string }) {
    const where: any = {
      status: 'PUBLISHED',
      AND: [],
    };

    if (query) {
      where.AND.push({
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      });
    }

    if (filters?.tag) {
      where.AND.push({ tags: { some: { tag: { slug: filters.tag } } } });
    }

    if (filters?.difficulty) {
      where.AND.push({ difficulty: filters.difficulty });
    }

    if (filters?.creatorId) {
      where.AND.push({ creatorId: filters.creatorId });
    }

    if (!where.AND.length) delete where.AND;

    return this.prisma.course.findMany({
      where,
      include: {
        creator: { select: { id: true, name: true, avatarUrl: true } },
        tags: { include: { tag: true } },
        _count: { select: { likes: true, forkRecords: true } },
      },
      orderBy: { publishedAt: 'desc' },
      take: 50,
    });
  }

  async getTags() {
    return this.prisma.tag.findMany({ orderBy: { name: 'asc' } });
  }
}
