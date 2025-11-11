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
import { OrderItem } from './order_item.model';

import { CartItem } from './cart_item.model';
import { ProductToppingGroup } from './product_topping_group.model';

@Table
export class Product extends Model<Product> {
  @Column({ allowNull: false, type: DataType.STRING })
  declare name: string;

  @Column({ allowNull: true, type: DataType.TEXT })
  declare description: string;

  @Column({ allowNull: false, type: DataType.FLOAT })
  declare basePrice: number;

  @Column({ allowNull: false, type: DataType.STRING })
  declare image: string;

  @Column({ defaultValue: true, type: DataType.BOOLEAN })
  declare isActive: boolean;

  @ForeignKey(() => Category)
  @Column({ allowNull: false, type: DataType.INTEGER })
  declare categoryId: number;

  @ForeignKey(() => Merchant)
  @Column({ allowNull: false, type: DataType.INTEGER })
  declare merchantId: number;

  @BelongsTo(() => Category)
  declare category: Category;

  @BelongsTo(() => Merchant)
  declare merchant: Merchant[];

  @HasMany(() => ProductToppingGroup)
  productToppingGroups: ProductToppingGroup[];

  @HasMany(() => OrderItem)
  declare orderItem: OrderItem[];

  @HasMany(() => CartItem)
  declare cartItems: CartItem[];
}
