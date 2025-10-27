import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class filterProductDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  sortOrder?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  minPrice?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  maxPrice?: number;
}
