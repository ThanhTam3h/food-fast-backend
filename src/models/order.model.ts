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
  PENDING = 'Đang chờ',
  CONFIRMED = 'Đã xác nhận',
  CANCELLED = 'Đã hủy',
  PREPARING = 'Đang chuẩn bị',
  READY = 'Sẵn sàng',
  DELIVERED = 'Đã giao hàng',
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
  orderNumber: string;

  @Column({
    allowNull: false,
    type: DataType.ENUM(...Object.values(OrderStatus)),
  })
  status: OrderStatus;

  @Column({
    allowNull: false,
    type: DataType.ENUM(...Object.values(PaymentStatus)),
  })
  paymentStatus: PaymentStatus;

  @Column({
    allowNull: false,
    type: DataType.ENUM(...Object.values(PaymentMethod)),
  })
  paymentMethod: PaymentMethod;

  @Column({ allowNull: false, type: DataType.FLOAT })
  subTotal: number;

  @Column({ defaultValue: 0, type: DataType.FLOAT })
  deliveryFee: number;

  @Column({ allowNull: false, type: DataType.FLOAT })
  total: number;

  @Column({ allowNull: true, type: DataType.TEXT })
  notes: string;

  @ForeignKey(() => User)
  @Column({ allowNull: false, type: DataType.INTEGER })
  userId: number;

  @ForeignKey(() => Address)
  @Column({ allowNull: false, type: DataType.INTEGER })
  addressId: number;

  @ForeignKey(() => Merchant)
  @Column({ allowNull: false, type: DataType.INTEGER })
  merchantId: number;

  @ForeignKey(() => Drone)
  @Column({
    allowNull: false,
    type: DataType.INTEGER,
  })
  droneId: number;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Address)
  address: Address;

  @BelongsTo(() => Merchant)
  merchant: Merchant;

  @HasMany(() => OrderItem)
  orderItems: OrderItem[];
}
