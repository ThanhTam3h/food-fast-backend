import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class filterProductDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  merchantId?: number;

  @ApiProperty({ required: false })
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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  minPrice?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  maxPrice?: number;
}
