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
  name: string;

  @Column({ allowNull: true, type: DataType.STRING })
  size: string;

  @Column({ allowNull: true, type: DataType.STRING })
  type: string;

  @Column({ allowNull: true, type: DataType.FLOAT })
  modifiedPrice: number;

  @Column({ defaultValue: true, type: DataType.BOOLEAN })
  isActive: boolean;

  @ForeignKey(() => Product)
  @Column({ allowNull: false, type: DataType.INTEGER })
  productId: number;

  @BelongsTo(() => Product)
  product: Product;

  @HasMany(() => OrderItem)
  orderItems: OrderItem[];

  @HasMany(() => CartItem)
  cartItems: CartItem[];
}
