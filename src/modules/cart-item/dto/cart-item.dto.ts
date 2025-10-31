import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional } from 'class-validator';

export class CreateCartItemDto {
  @ApiProperty()
  @IsOptional()
  productId: number;

  @ApiProperty()
  @IsOptional()
  variantId: number;

  @ApiProperty()
  @IsOptional()
  quantity: number;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  toppingId?: number[];
}
