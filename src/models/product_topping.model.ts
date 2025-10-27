import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Product } from './product.model';
import { Topping } from './topping.model';

@Table
export class ProductTopping extends Model<ProductTopping> {
  @ForeignKey(() => Product)
  @Column({ allowNull: false, type: DataType.INTEGER })
  declare productId: number;

  @ForeignKey(() => Topping)
  @Column({ allowNull: false, type: DataType.INTEGER })
  declare toppingId: number;

  @Column({ allowNull: false, type: DataType.BOOLEAN })
  declare isDefault: boolean;

  @Column({ allowNull: false, type: DataType.INTEGER })
  declare quantity: number;

  @BelongsTo(() => Product)
  declare product: Product;

  @BelongsTo(() => Topping)
  declare topping: Topping;
}
