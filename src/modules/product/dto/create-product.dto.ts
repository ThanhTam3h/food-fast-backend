import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateProductToppingGroupDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  toppingGroupId: number;
}

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  basePrice: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  image?: string;

  @IsBoolean()
  @IsOptional()
  isActive: boolean;

  @ApiProperty()
  @IsNumber()
  categoryId: number;

  @ApiProperty()
  @IsNumber()
  merchantId: number;

  @ApiProperty({ type: [CreateProductToppingGroupDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductToppingGroupDto)
  @IsOptional()
  productToppingGroups: CreateProductToppingGroupDto[];
}
