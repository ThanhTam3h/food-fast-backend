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
import { Product } from './product.model';
import { Topping } from './topping.model';

@Table
export class Category extends Model<Category> {
  @Column({ allowNull: false, type: DataType.STRING })
  name: string;

  @Column({ allowNull: true, type: DataType.TEXT })
  description: string;

  @Column({ allowNull: false, type: DataType.STRING })
  image: string;

  @Column({ allowNull: false, type: DataType.BOOLEAN })
  isActive: boolean;

  @ForeignKey(() => Merchant)
  @Column({ allowNull: false, type: DataType.INTEGER })
  merchantId: number;

  @BelongsTo(() => Merchant)
  merchant: Merchant;

  @HasMany(() => Product)
  products: Product[];

  @HasMany(() => Topping)
  toppings: Topping[];
}
