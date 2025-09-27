import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { OrderItem } from './order_item.model';
import { Topping } from './topping.model';

@Table
export class OrderItemTopping extends Model<OrderItemTopping> {
  @ForeignKey(() => OrderItem)
  @Column({ allowNull: false, type: DataType.INTEGER })
  orderItemId: number;

  @ForeignKey(() => Topping)
  @Column({ allowNull: false, type: DataType.INTEGER })
  toppingId: number;

  @Column({ allowNull: false, type: DataType.INTEGER })
  quantity: number;

  @BelongsTo(() => OrderItem)
  orderItem: OrderItem;

  @BelongsTo(() => Topping)
  topping: Topping;
}
