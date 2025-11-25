import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateToppingDto {
  @ApiProperty({ example: 'Thêm phô mai' })
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  id: number;

  @ApiProperty({ example: 10000 })
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  topping_group_id?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}
