import { Controller, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ChaptersService } from './chapters.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Chapters')
@ApiBearerAuth()
@Controller('courses/:courseId/chapters')
export class ChaptersController {
  constructor(private chaptersService: ChaptersService) {}

  @Post()
  create(
    @Param('courseId') courseId: string,
    @CurrentUser() user: any,
    @Body() body: { title: string; description?: string },
  ) {
    return this.chaptersService.create(courseId, user.id, body);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { title?: string; description?: string },
  ) {
    return this.chaptersService.update(id, user.id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.chaptersService.delete(id, user.id);
  }

  @Post('reorder')
  reorder(
    @Param('courseId') courseId: string,
    @CurrentUser() user: any,
    @Body() body: { chapterIds: string[] },
  ) {
    return this.chaptersService.reorder(courseId, user.id, body.chapterIds);
  }
}
