import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty } from 'class-validator';

export class AddGroupToProductDto {
  @ApiProperty({ example: 12 })
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @ApiProperty({ example: [1, 2, 3] })
  @IsArray()
  @IsNotEmpty()
  toppingGroupIds: number[];
}
