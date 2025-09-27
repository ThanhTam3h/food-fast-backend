import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Product } from './product.model';
import { Topping } from './topping.model';


@Table
export class ProductTopping extends Model<ProductTopping> {
  @ForeignKey(() => Product)
  @Column({ allowNull: false, type: DataType.INTEGER })
  productId: number;

  @ForeignKey(() => Topping)
  @Column({ allowNull: false, type: DataType.INTEGER })
  toppingId: number;

  @Column({ allowNull: false, type: DataType.BOOLEAN })
  isDefault: boolean;

  @Column({ allowNull: false, type: DataType.INTEGER })
  quantity: number;

  @BelongsTo(() => Product)
  product: Product;


}
