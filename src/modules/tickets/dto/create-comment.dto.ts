import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ example: 'I have checked and the issue seems to be...' })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiPropertyOptional({ example: false, description: 'Internal comments are hidden from requesters' })
  @IsBoolean()
  @IsOptional()
  isInternal?: boolean;
}
