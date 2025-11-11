import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { Cart } from './cart.model';
import { Category } from './category.model';
import { Order } from './order.model';
import { Product } from './product.model';
import { Topping } from './topping.model';
import { UserRole } from './user_role.model';
import { ToppingGroup } from './topping_group.model';

@Table
export class Merchant extends Model<Merchant> {
  @Column({ allowNull: false, type: DataType.STRING })
  declare name: string;

  @Column({ allowNull: true, type: DataType.TEXT })
  declare description: string;

  @Column({ allowNull: true, type: DataType.STRING })
  declare logo: string;

  @Column({ allowNull: true, type: DataType.STRING })
  declare image: string;

  @Column({ allowNull: true, type: DataType.STRING })
  declare phone: string;

  @Column({ allowNull: true, unique: true, type: DataType.STRING })
  declare email: string;

  @Column({ allowNull: true, type: DataType.STRING })
  declare address: string;

  @Column({ allowNull: true, type: DataType.GEOGRAPHY('POINT', 4326) })
  declare location: string;

  @Column({ defaultValue: false, type: DataType.BOOLEAN })
  declare is_temporarily_closed: boolean;

  @HasMany(() => Product)
  declare products: Product[];

  @HasMany(() => Order)
  declare orders: Order[];

  @HasMany(() => Cart)
  declare carts: Cart[];

  @HasMany(() => Category)
  declare categories: Category[];

  @HasMany(() => ToppingGroup)
  toppingGroups: ToppingGroup[];

  @HasMany(() => UserRole)
  declare userRoles: UserRole[];
}
