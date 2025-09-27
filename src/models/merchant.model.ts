import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { Cart } from './cart.model';
import { Category } from './category.model';
import { Order } from './order.model';
import { Product } from './product.model';
import { Topping } from './topping.model';
import { UserRole } from './user_role.model';

@Table
export class Merchant extends Model<Merchant> {
  @Column({ allowNull: false, type: DataType.STRING })
  name: string;

  @Column({ allowNull: true, type: DataType.TEXT })
  description: string;

  @Column({ allowNull: true, type: DataType.STRING })
  logo: string;

  @Column({ allowNull: true, type: DataType.STRING })
  image: string;

  @Column({ allowNull: true, type: DataType.STRING })
  phone: string;

  @Column({ allowNull: true, unique: true, type: DataType.STRING })
  email: string;

  @Column({ allowNull: true, type: DataType.STRING })
  address: string;

  @Column({ allowNull: true, type: DataType.GEOGRAPHY('POINT', 4326) })
  location: string;

  @Column({ defaultValue: false, type: DataType.BOOLEAN })
  is_temporarily_closed: boolean;

  @HasMany(() => Product)
  products: Product[];

  @HasMany(() => Order)
  orders: Order[];

  @HasMany(() => Cart)
  carts: Cart[];

  @HasMany(() => Category)
  categories: Category[];

  @HasMany(() => Topping)
  toppings: Category[];

  @HasMany(() => UserRole)
  userRoles: UserRole[];
}
