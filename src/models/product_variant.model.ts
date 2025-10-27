import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { CartItem } from './cart_item.model';
import { OrderItem } from './order_item.model';
import { Product } from './product.model';

@Table
export class ProductVariant extends Model<ProductVariant> {
  @Column({ allowNull: false, type: DataType.STRING })
  declare name: string;

  @Column({ allowNull: true, type: DataType.STRING })
  declare size: string;

  @Column({ allowNull: true, type: DataType.STRING })
  declare type: string;

  @Column({ allowNull: true, type: DataType.FLOAT })
  declare modifiedPrice: number;

  @Column({ defaultValue: true, type: DataType.BOOLEAN })
  declare isActive: boolean;

  @ForeignKey(() => Product)
  @Column({ allowNull: false, type: DataType.INTEGER })
  declare productId: number;

  @BelongsTo(() => Product)
  declare product: Product;

  @HasMany(() => OrderItem)
  declare orderItems: OrderItem[];

  @HasMany(() => CartItem)
  declare cartItems: CartItem[];
}
