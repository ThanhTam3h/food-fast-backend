import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  street: string;

  @ApiProperty({ example: { type: 'Point', coordinates: [105.123, 21.031] } })
  @IsNotEmpty()
  location: {
    type: 'Point';
    coordinates: [number, number];
  };

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
