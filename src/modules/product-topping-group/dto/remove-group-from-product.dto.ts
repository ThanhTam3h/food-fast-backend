import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class RemoveGroupFromProductDto {
  @ApiProperty({ example: 12 })
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @ApiProperty({ example: 3 })
  @IsInt()
  @IsNotEmpty()
  toppingGroupId: number;
}
