import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash, ...rest } = user as any;
    return rest;
  }

  async findByUsername(id: string) {
    return this.findById(id);
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        courses: {
          where: { status: 'PUBLISHED' },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { _count: { select: { likes: true, forkRecords: true } } },
        },
        _count: { select: { courses: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash, ...rest } = user as any;
    return rest;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    await this.prisma.profile.upsert({
      where: { userId },
      update: dto,
      create: { userId, ...dto },
    });

    if (dto.name) {
      await this.prisma.user.update({ where: { id: userId }, data: { name: dto.name } });
    }

    return this.findById(userId);
  }

  async getBookmarks(userId: string) {
    return this.prisma.bookmark.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            creator: { select: { id: true, name: true, avatarUrl: true } },
            _count: { select: { likes: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
