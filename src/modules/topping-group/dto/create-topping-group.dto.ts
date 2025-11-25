// import { ApiProperty } from '@nestjs/swagger';
// import {
//   IsBoolean,
//   IsInt,
//   IsNotEmpty,
//   IsOptional,
//   IsString,
//   Min,
// } from 'class-validator';

// export class CreateToppingGroupDto {
//   @ApiProperty()
//   @IsString()
//   @IsNotEmpty()
//   name: string;

//   @ApiProperty()
//   @IsBoolean()
//   @IsOptional()
//   is_required?: boolean;

//   @ApiProperty()
//   @IsInt()
//   @Min(0)
//   @IsOptional()
//   minSelection?: number;

//   @ApiProperty()
//   @IsInt()
//   @Min(1)
//   @IsOptional()
//   maxSelection?: number;

//   @ApiProperty()
//   @IsInt()
//   @IsNotEmpty()
//   merchantId: number;
// }

import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreateToppingDto } from 'src/modules/topping/dto/create-topping.dto';

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

  @ApiProperty({
    type: [CreateToppingDto],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateToppingDto)
  @IsOptional()
  toppings?: CreateToppingDto[];
}
