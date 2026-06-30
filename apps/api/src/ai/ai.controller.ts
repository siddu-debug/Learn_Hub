import {
  Controller, Post, Get, Body, Param, Query,
  UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { RagService } from './rag.service';
import { GenerateCourseDto } from './dto/generate-course.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import * as pdfParse from 'pdf-parse';

@ApiTags('AI')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(private aiService: AiService, private ragService: RagService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate course from prompt/URL/GitHub' })
  generate(@CurrentUser() user: any, @Body() dto: GenerateCourseDto) {
    return this.aiService.generateFromPrompt(user.id, dto);
  }

  @Post('generate/pdf')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Generate course from PDF upload' })
  async generateFromPdf(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
    @Body('topic') topic?: string,
  ) {
    const data = await pdfParse(file.buffer);
    return this.aiService.generateFromPrompt(user.id, {
      type: 'pdf',
      content: data.text.slice(0, 8000),
      topic,
    });
  }

  @Post('courses/:courseId/chat')
  @ApiOperation({ summary: 'Chat with AI tutor about a course' })
  chat(
    @CurrentUser() user: any,
    @Param('courseId') courseId: string,
    @Body() body: { message: string; sessionId?: string },
  ) {
    return this.ragService.chat(user.id, courseId, body.sessionId || null, body.message);
  }

  @Get('courses/:courseId/chat/sessions')
  @ApiOperation({ summary: 'Get chat sessions for a course' })
  getSessions(@CurrentUser() user: any, @Param('courseId') courseId: string) {
    return this.ragService.getSessions(user.id, courseId);
  }

  @Get('chat/sessions/:sessionId/messages')
  @ApiOperation({ summary: 'Get messages for a chat session' })
  getHistory(@Param('sessionId') sessionId: string) {
    return this.ragService.getHistory(sessionId);
  }
}
