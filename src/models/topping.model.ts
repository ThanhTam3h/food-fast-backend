import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { CartItemTopping } from './cart_item_topping.model';
import { OrderItemTopping } from './order_item_topping.model';
import { ToppingGroup } from './topping_group.model';

@Table
export class Topping extends Model<Topping> {
  @Column({ allowNull: false, type: DataType.STRING })
  declare name: string;

  @Column({ allowNull: false, type: DataType.FLOAT })
  declare price: number;

  @Column({ defaultValue: true, type: DataType.BOOLEAN })
  declare is_active: boolean;

  @Column({ defaultValue: false, type: DataType.BOOLEAN })
  declare is_default: boolean;

  @ForeignKey(() => ToppingGroup)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare topping_group_id: number;

  @BelongsTo(() => ToppingGroup)
  declare topping_group: ToppingGroup;

  @HasMany(() => CartItemTopping)
  declare cart_item_toppings: CartItemTopping[];

  @HasMany(() => OrderItemTopping)
  declare order_item_toppings: OrderItemTopping[];
}
