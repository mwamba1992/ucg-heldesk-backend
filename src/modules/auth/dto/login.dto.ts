import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'admin',
    description: 'Username for authentication',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    example: 'admin123',
    description: 'User password',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
