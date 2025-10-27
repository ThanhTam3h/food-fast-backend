import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class CreateProductToppingDto {
  @ApiProperty()
  @IsNumber()
  toppingId: number;

  @ApiProperty()
  @IsBoolean()
  isDefault: boolean;

  @ApiProperty()
  @IsNumber()
  quantity: number;
}

export class CreateProductVariantDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty()
  @IsString()
  size: string;

  @ApiProperty()
  @IsNumber()
  modifiedPrice: number;
}

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  basePrice: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsString()
  image: string;

  @ApiProperty()
  @IsNumber()
  categoryId: number;

  @ApiProperty()
  @IsNumber()
  merchantId: number;

  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  productVariants: CreateProductVariantDto[];

  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductToppingDto)
  productToppings: CreateProductToppingDto[];
}
