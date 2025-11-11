import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Merchant } from './merchant.model';
import { ProductToppingGroup } from './product_topping_group.model';
import { Topping } from './topping.model';

@Table
export class ToppingGroup extends Model<ToppingGroup> {
  @Column({ allowNull: false, type: DataType.STRING })
  declare name: string;

  @Column({ defaultValue: false, type: DataType.BOOLEAN })
  declare is_required: boolean;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  declare minSelection: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 1,
  })
  declare maxSelection: number;

  @ForeignKey(() => Merchant)
  @Column({ allowNull: false, type: DataType.INTEGER })
  declare merchantId: number;

  @BelongsTo(() => Merchant)
  declare merchant: Merchant;

  @HasMany(() => Topping)
  declare toppings: Topping[];

  @HasMany(() => ProductToppingGroup)
  declare productToppingGroups: ProductToppingGroup[];
}
