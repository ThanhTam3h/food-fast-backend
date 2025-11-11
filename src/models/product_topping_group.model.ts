import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Product } from './product.model';
import { ToppingGroup } from './topping_group.model';

@Table
export class ProductToppingGroup extends Model<ProductToppingGroup> {
  @ForeignKey(() => Product)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare productId: number;

  @ForeignKey(() => ToppingGroup)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare toppingGroupId: number;

  @BelongsTo(() => Product)
  declare product: Product;

  @BelongsTo(() => ToppingGroup)
  declare toppingGroup: ToppingGroup;
}
