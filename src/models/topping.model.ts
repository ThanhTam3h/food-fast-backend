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
  declare name: string;

  @Column({ allowNull: false, type: DataType.STRING })
  declare image: string;

  @Column({ allowNull: true, type: DataType.TEXT })
  declare description: string;

  @Column({ allowNull: false, type: DataType.FLOAT })
  declare price: number;

  @Column({ allowNull: false, type: DataType.INTEGER })
  declare quantity: number;

  @Column({ defaultValue: true, type: DataType.BOOLEAN })
  declare is_active: boolean;

  @Column({ defaultValue: false, type: DataType.BOOLEAN })
  declare is_required: boolean;

  @ForeignKey(() => Category)
  @Column({ allowNull: false, type: DataType.INTEGER })
  declare categoryId: number;

  @ForeignKey(() => Merchant)
  @Column({ allowNull: false, type: DataType.INTEGER })
  declare merchantId: number;

  @BelongsTo(() => Category)
  declare category: Category;

  @BelongsTo(() => Merchant)
  declare merchant: Merchant;

  @HasMany(() => ProductTopping)
  declare productToppings: ProductTopping[];

  @HasMany(() => CartItemTopping)
  declare cartItemTopping: CartItemTopping[];
}
