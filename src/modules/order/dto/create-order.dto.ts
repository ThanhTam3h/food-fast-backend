import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from 'src/models/order.model';

export class CreateOrderDto {
  @ApiProperty()
  @IsNumber()
  userId: number;

  @ApiProperty()
  @IsNumber()
  merchantId: number;

  @ApiProperty()
  @IsNumber()
  addressId: number;

  @ApiProperty({
    type: () => [Object],
    description: 'Danh sách sản phẩm trong đơn hàng',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  orderItems: Array<{
    productId: number;
    variantId: number;
    quantity: number;
    toppings?: Array<{
      toppingId: number;
      quantity: number;
    }>;
  }>;

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
