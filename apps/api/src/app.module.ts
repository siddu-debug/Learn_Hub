import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CoursesModule } from './courses/courses.module';
import { ChaptersModule } from './chapters/chapters.module';
import { LessonsModule } from './lessons/lessons.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { AiModule } from './ai/ai.module';
import { SearchModule } from './search/search.module';
import { AdminModule } from './admin/admin.module';
import { ProgressModule } from './progress/progress.module';
import { PrismaModule } from './common/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: (configService: ConfigService) => ({
        store: 'memory',
        max: 100,
        ttl: 300,
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CoursesModule,
    ChaptersModule,
    LessonsModule,
    QuizzesModule,
    AiModule,
    SearchModule,
    AdminModule,
    ProgressModule,
  ],
})
export class AppModule {}
