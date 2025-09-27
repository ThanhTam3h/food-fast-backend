import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Category } from './category.model';
import { Merchant } from './merchant.model';
import { ProductTopping } from './product_topping.model';
import { CartItemTopping } from './cart_item_topping.model';

@Table
export class Topping extends Model<Topping> {
  @Column({ allowNull: false, type: DataType.STRING })
  name: string;

  @Column({ allowNull: false, type: DataType.STRING })
  image: string;

  @Column({ allowNull: true, type: DataType.TEXT })
  description: string;

  @Column({ allowNull: false, type: DataType.FLOAT })
  price: number;

  @Column({ allowNull: false, type: DataType.INTEGER })
  quantity: number;

  @Column({ defaultValue: true, type: DataType.BOOLEAN })
  is_active: boolean;

  @Column({ defaultValue: false, type: DataType.BOOLEAN })
  is_required: boolean;

  @ForeignKey(() => Category)
  @Column({ allowNull: false, type: DataType.INTEGER })
  categoryId: number;

  @ForeignKey(() => Merchant)
  @Column({ allowNull: false, type: DataType.INTEGER })
  merchantId: number;

  @BelongsTo(() => Category)
  category: Category;

  @BelongsTo(() => Merchant)
  merchant: Merchant;

  @HasMany(() => ProductTopping)
  productToppings: ProductTopping[];

  @HasMany(() => CartItemTopping)
  cartItemTopping: CartItemTopping[];
}
