import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional } from 'class-validator';

export class CreateCartItemDto {
  @ApiProperty()
  @IsOptional()
  productId: number;

  @ApiProperty()
  @IsOptional()
  quantity: number;

  @ApiProperty({ example: [1, 3, 5], required: false })
  @IsArray()
  @IsOptional()
  selectedToppingIds?: number[];
}
