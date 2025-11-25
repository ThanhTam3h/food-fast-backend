import { PartialType } from '@nestjs/mapped-types';
import { CreateDroneHubDto } from './create-dronehub.dto';

export class UpdateDroneHubDto extends PartialType(CreateDroneHubDto) {}
