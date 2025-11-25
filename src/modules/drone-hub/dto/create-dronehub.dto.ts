import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDroneHubDto {
  @ApiProperty()
  @IsString()
  street: string;

  @ApiProperty({ example: { type: 'Point', coordinates: [105.123, 21.031] } })
  @IsNotEmpty()
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
}
