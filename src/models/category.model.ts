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

@Table
export class Category extends Model<Category> {
  @Column({ allowNull: false, type: DataType.STRING })
  declare name: string;

  @Column({ allowNull: true, type: DataType.TEXT })
  declare description: string;

  @Column({ allowNull: true, type: DataType.STRING })
  declare image: string;

  @Column({ allowNull: false, type: DataType.BOOLEAN , defaultValue: true})
  declare isActive: boolean;

  @ForeignKey(() => Merchant)
  @Column({ allowNull: false, type: DataType.INTEGER })
  declare merchantId: number;

  @BelongsTo(() => Merchant)
  declare merchant: Merchant;

  @HasMany(() => Product)
  declare products: Product[];
}
