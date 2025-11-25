import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Order } from './order.model';
import { User } from './user.model';

@Table
export class Address extends Model<Address> {
  @Column({ allowNull: false, type: DataType.STRING })
  declare street: string;

  @Column({ allowNull: true, type: DataType.GEOGRAPHY('POINT', 4326) })
  declare location: string;

  @Column({ defaultValue: false, type: DataType.BOOLEAN })
  declare isDefault: boolean;

  @ForeignKey(() => User)
  @Column({ allowNull: true, type: DataType.INTEGER })
  declare userId: number;

  @BelongsTo(() => User)
  declare user: User;

  @HasMany(() => Order)
  declare orders: Order[];
}
