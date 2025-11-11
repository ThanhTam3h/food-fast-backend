import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateToppingGroupDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  is_required?: boolean;

  @ApiProperty()
  @IsInt()
  @Min(0)
  @IsOptional()
  minSelection?: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @IsOptional()
  maxSelection?: number;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  merchantId: number;
}
