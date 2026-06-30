import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { LessonsService } from './lessons.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Lessons')
@ApiBearerAuth()
@Controller()
export class LessonsController {
  constructor(private lessonsService: LessonsService) {}

  @Post('chapters/:chapterId/lessons')
  create(
    @Param('chapterId') chapterId: string,
    @CurrentUser() user: any,
    @Body() body: { title: string; content?: string; duration?: number },
  ) {
    return this.lessonsService.create(chapterId, user.id, body);
  }

  @Public()
  @Get('lessons/:id')
  findOne(@Param('id') id: string) {
    return this.lessonsService.findOne(id);
  }

  @Put('lessons/:id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { title?: string; content?: string; duration?: number },
  ) {
    return this.lessonsService.update(id, user.id, body);
  }

  @Delete('lessons/:id')
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.lessonsService.delete(id, user.id);
  }

  @Post('lessons/:id/complete')
  complete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.lessonsService.completeLesson(user.id, id);
  }
}
