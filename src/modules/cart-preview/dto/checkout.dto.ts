import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class TemporaryAddressDto {
  @ApiProperty({ example: 'Hà Nội' })
  @IsString()
  @Type(() => String)
  city: string;

  @ApiProperty({ example: 'Phường Bách Khoa' })
  @IsString()
  @Type(() => String)
  ward: string;

  @ApiProperty({ example: 'Quận Hai Bà Trưng' })
  @IsString()
  @Type(() => String)
  district: string;

  @ApiProperty({
    example: { type: 'Point', coordinates: [105.8412, 21.0245] },
    description: 'Tọa độ địa lý theo định dạng GeoJSON (longitude, latitude)',
  })
  @IsNotEmpty()
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };


}

export class CheckoutCaculateDto {
  @ApiProperty({
    example: [1, 2, 3],
    description: 'Danh sách ID các cart item cần thanh toán',
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  cartItemId: number[];

  @ApiProperty({
    example: 5,
    required: false,
    description: 'ID địa chỉ đã lưu (nếu người dùng chọn)',
  })
  @IsOptional()
  @IsNumber()
  addressId?: number;

  @ApiProperty({
    required: false,
    type: () => TemporaryAddressDto,
    description:
      'Địa chỉ tạm thời (nếu người dùng nhập địa chỉ giao hàng mới, không dùng địa chỉ đã lưu)',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TemporaryAddressDto)
  temporaryAddress?: TemporaryAddressDto;

  @ApiProperty()
  @IsNumber()
  distance: number;
}
