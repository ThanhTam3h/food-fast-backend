import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class UpdateProductToppingGroupDto {
  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty({ example: 2 })
  @IsOptional()
  @IsNumber()
  toppingGroupId?: number;
}

export class UpdateProductDto {
  @ApiProperty({ example: 'Trà sữa trân châu' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 35000 })
  @IsOptional()
  @IsNumber()
  basePrice?: number;

  @ApiProperty({ example: 'Mô tả sản phẩm' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ example: true, type: Boolean })
  @IsOptional()
  @IsBoolean({ message: 'isActive phải là true hoặc false' })
  isActive: boolean;

  @ApiProperty({ example: 2 })
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  merchantId?: number;

  @ApiProperty({
    type: [UpdateProductToppingGroupDto],
    description: 'Nhóm topping của sản phẩm',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateProductToppingGroupDto)
  productToppingGroups?: UpdateProductToppingGroupDto[];
}
