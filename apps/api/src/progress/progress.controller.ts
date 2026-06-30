import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Progress')
@ApiBearerAuth()
@Controller('progress')
export class ProgressController {
  constructor(private progressService: ProgressService) {}

  @Get('dashboard')
  getDashboard(@CurrentUser() user: any) {
    return this.progressService.getDashboardStats(user.id);
  }

  @Get('mine')
  getMyProgress(@CurrentUser() user: any) {
    return this.progressService.getMyProgress(user.id);
  }

  @Get('courses/:courseId')
  getCourseProgress(@CurrentUser() user: any, @Param('courseId') courseId: string) {
    return this.progressService.getCourseProgress(user.id, courseId);
  }
}
