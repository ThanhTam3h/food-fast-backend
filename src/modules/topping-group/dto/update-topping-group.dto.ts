import { PartialType } from '@nestjs/swagger';
import { CreateToppingGroupDto } from './create-topping-group.dto';

export class UpdateToppingGroupDto extends PartialType(CreateToppingGroupDto) {}
