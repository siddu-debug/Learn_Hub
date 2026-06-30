import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class GenerateCourseDto {
  @ApiProperty()
  @IsEnum(['prompt', 'pdf', 'url', 'github'])
  type: 'prompt' | 'pdf' | 'url' | 'github';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  prompt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  topic?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content?: string; // pre-extracted text from PDF

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  url?: string;
}
