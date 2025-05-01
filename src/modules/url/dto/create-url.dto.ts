import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
export class CreateUrlDto {
  @ApiProperty({
    description: 'URL to redirect',
    example: 'http://example.com',
  })
  @IsUrl()
  redirect: string;
  @ApiProperty({ description: 'URL title', example: 'My special link' })
  @IsString()
  @IsNotEmpty()
  title: string;
  @ApiProperty({
    description: 'URL description',
    example: 'This is a special link',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
