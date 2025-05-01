import { IsInt, IsOptional, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetUrlsDto {
  @ApiProperty({ description: 'The title of the URL' })
  @IsOptional()
  filter?: string;
  @ApiProperty({ description: 'The page number' })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  @Min(1)
  page?: number;
  @ApiProperty({ description: 'The number of items per page' })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  @Min(1)
  limit?: number;
}
