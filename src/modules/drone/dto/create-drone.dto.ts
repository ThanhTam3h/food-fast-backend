import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { DroneStatus } from 'src/models/drone.model';

export class CreateDroneDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  battery: number;

  @ApiProperty()
  @IsOptional()
  @IsEnum(DroneStatus)
  status?: DroneStatus;

  @ApiProperty()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  hubId?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  orderId?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  payloadCapacityKg?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  serialNumber?: string;
}
