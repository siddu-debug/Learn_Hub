import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { QuizzesService } from './quizzes.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Quizzes')
@ApiBearerAuth()
@Controller('quizzes')
export class QuizzesController {
  constructor(private quizzesService: QuizzesService) {}

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quizzesService.findOne(id);
  }

  @Post(':id/attempt')
  submitAttempt(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { answers: { questionId: string; answerId: string }[] },
  ) {
    return this.quizzesService.submitAttempt(user.id, id, body.answers);
  }

  @Get(':id/attempts')
  getAttempts(@Param('id') id: string, @CurrentUser() user: any) {
    return this.quizzesService.getAttempts(user.id, id);
  }
}
