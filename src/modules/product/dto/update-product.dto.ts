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

export class UpdateProductToppingDto {
  @ApiProperty({
    example: 1,
    description: 'ID của bản ghi ProductTopping',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty({ example: 5, description: 'ID của topping' })
  @IsOptional()
  @IsNumber()
  toppingId?: number;

  @ApiProperty({ example: true, description: 'Topping mặc định hay không' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiProperty({ example: 2, description: 'Số lượng topping' })
  @IsOptional()
  @IsNumber()
  quantity?: number;
}

export class UpdateProductVariantDto {
  @ApiProperty({
    example: 1,
    description: 'ID của biến thể sản phẩm',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty({ example: 'Size L', description: 'Tên biến thể' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Loại nóng/lạnh', description: 'Loại biến thể' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ example: '500ml', description: 'Kích thước sản phẩm' })
  @IsOptional()
  @IsString()
  size?: string;

  @ApiProperty({ example: 10000, description: 'Giá thay đổi so với basePrice' })
  @IsOptional()
  @IsNumber()
  modifiedPrice?: number;
}

export class UpdateProductDto {
  @ApiProperty({ example: 'Trà sữa trân châu', description: 'Tên sản phẩm' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 35000, description: 'Giá cơ bản' })
  @IsOptional()
  @IsNumber()
  basePrice?: number;

  @ApiProperty({
    example: 'Thức uống yêu thích giới trẻ',
    description: 'Mô tả sản phẩm',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: 'Ảnh sản phẩm',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ example: 2, description: 'ID danh mục' })
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @ApiProperty({ example: 1, description: 'ID của merchant' })
  @IsOptional()
  @IsNumber()
  merchantId?: number;

  @ApiProperty({
    type: [UpdateProductVariantDto],
    description: 'Danh sách biến thể sản phẩm',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateProductVariantDto)
  productVariants?: UpdateProductVariantDto[];

  @ApiProperty({
    type: [UpdateProductToppingDto],
    description: 'Danh sách topping của sản phẩm',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateProductToppingDto)
  productToppings?: UpdateProductToppingDto[];
}
