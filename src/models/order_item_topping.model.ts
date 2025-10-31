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
  declare orderItemId: number;

  @ForeignKey(() => Topping)
  @Column({ allowNull: false, type: DataType.INTEGER })
  declare toppingId: number;

  @Column({ allowNull: false, type: DataType.INTEGER })
  declare quantity: number;

  @BelongsTo(() => OrderItem)
  declare orderItem: OrderItem;

  @BelongsTo(() => Topping)
  declare topping: Topping;
}
