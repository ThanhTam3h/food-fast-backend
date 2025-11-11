import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PaymentMethod } from 'src/models/order.model';
import { TemporaryAddressDto } from 'src/modules/cart-preview/dto/checkout.dto';

export class OrderItemToppingDto {
  @ApiProperty()
  @IsNumber()
  toppingId: number;

  @ApiProperty()
  @IsNumber()
  quantity: number;
}

export class OrderItemDto {
  @ApiProperty()
  @IsNumber()
  productId: number;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty({ type: () => [OrderItemToppingDto], required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => OrderItemToppingDto)
  toppings?: OrderItemToppingDto[];
}

export class CreateOrderDto {
  @ApiProperty()
  @IsNumber()
  userId: number;

  @ApiProperty()
  @IsNumber()
  merchantId: number;

  // @ApiProperty()
  // @IsNumber()
  // addressId: number;

  @ApiProperty({
    required: false,
    type: () => TemporaryAddressDto,
    description:
      'Địa chỉ tạm thời (nếu người dùng nhập địa chỉ giao hàng mới, không dùng địa chỉ đã lưu)',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TemporaryAddressDto)
  temporaryAddress: TemporaryAddressDto;

  // @ApiProperty({
  //   type: () => [Object],
  //   description: 'Danh sách sản phẩm trong đơn hàng',
  // })
  // @IsArray()
  // @ValidateNested({ each: true })
  // @Type(() => Object)
  // orderItems: Array<{
  //   productId: number;
  //   quantity: number;
  //   toppings?: Array<{
  //     toppingId: number;
  //     quantity: number;
  //   }>;
  // }>;

  @ApiProperty({ type: () => [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  orderItems: OrderItemDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty()
  @IsNumber()
  distance: number;
}
