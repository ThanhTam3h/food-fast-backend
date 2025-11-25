import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Address } from './address.model';
import { Drone } from './drone.model';
import { Merchant } from './merchant.model';
import { OrderItem } from './order_item.model';
import { User } from './user.model';

export enum OrderStatus {
  // PENDING = 'Đang chờ',
  // CONFIRMED = 'Đã xác nhận',
  // PREPARING = 'Đang chuẩn bị',
  // READY = 'Sẵn sàng',
  // DELIVERING = 'Đang giao hàng',
  // DELIVERED = 'Đã giao hàng',
  // CANCELLED = 'Đã hủy',

  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERING = 'DELIVERING',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  ONLINE = 'Thanh toán online',
}

export enum PaymentStatus {
  PAID = 'Đã thanh toán',
  FAILED = 'Thanh toán thất bại',
  PENDING = 'Đang chờ thanh toán',
  REFUNDED = 'Hoàn tiền',
}

@Table
export class Order extends Model<Order> {
  @Column({ allowNull: false, unique: true, type: DataType.STRING })
  declare orderNumber: string;

  @Column({
    allowNull: false,
    type: DataType.ENUM(...Object.values(OrderStatus)),
  })
  declare status: OrderStatus;

  @Column({
    allowNull: false,
    type: DataType.ENUM(...Object.values(PaymentStatus)),
  })
  declare paymentStatus: PaymentStatus;

  @Column({
    allowNull: false,
    type: DataType.ENUM(...Object.values(PaymentMethod)),
  })
  declare paymentMethod: PaymentMethod;

  @Column({ allowNull: false, type: DataType.FLOAT })
  declare subTotal: number;

  @Column({ defaultValue: 0, type: DataType.FLOAT })
  declare deliveryFee: number;

  @Column({ allowNull: false, type: DataType.FLOAT })
  declare total: number;

  @Column({ allowNull: true, type: DataType.TEXT })
  declare notes: string;

  @Column({ allowNull: true, type: DataType.STRING })
  declare stripePaymentIntentId: string;

  @ForeignKey(() => User)
  @Column({ allowNull: false, type: DataType.INTEGER })
  declare userId: number;

  @ForeignKey(() => Address)
  @Column({ allowNull: false, type: DataType.INTEGER })
  declare addressId: number;

  @ForeignKey(() => Merchant)
  @Column({ allowNull: false, type: DataType.INTEGER })
  declare merchantId: number;

  @ForeignKey(() => Drone)
  @Column({
    allowNull: true,
    type: DataType.INTEGER,
  })
  declare droneId: number;

  @BelongsTo(() => User)
  declare user: User;

  @BelongsTo(() => Address)
  declare address: Address;

  @BelongsTo(() => Merchant)
  declare merchant: Merchant;

  @HasMany(() => OrderItem)
  declare orderItems: OrderItem[];

  @BelongsTo(() => Drone)
  drone: Drone;
}
