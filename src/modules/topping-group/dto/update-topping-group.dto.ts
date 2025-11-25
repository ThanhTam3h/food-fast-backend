// import { PartialType } from '@nestjs/swagger';
// import { CreateToppingGroupDto } from './create-topping-group.dto';

// export class UpdateToppingGroupDto extends PartialType(CreateToppingGroupDto) {}

import { PartialType } from '@nestjs/swagger';
import { CreateToppingGroupDto } from './create-topping-group.dto';

import { Type } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { CreateToppingDto } from 'src/modules/topping/dto/create-topping.dto';

export class UpdateToppingGroupDto extends PartialType(CreateToppingGroupDto) {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateToppingDto)
  toppings?: CreateToppingDto[];
}
