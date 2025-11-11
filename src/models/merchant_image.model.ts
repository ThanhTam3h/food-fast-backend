import {
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  Model,
  Table,
} from 'sequelize-typescript';
import { Merchant } from './merchant.model';

export enum MerchantImageType {
  IDENTITY = 'IDENTITY',
  BUSINESS = 'BUSINESS',
  FOOD = 'FOOD',
  OTHERS = 'OTHERS',
  KITCHEN = 'KITCHEN',
  AVATAR = 'AVATAR',
  BACKGROUND = 'BACKGROUND',
}

@Table
export class MerchantImage extends Model<MerchantImage> {
  @Column({ allowNull: false, type: DataType.STRING })
  declare url: string;

  @Column({
    allowNull: false,
    type: DataType.ENUM(...Object.values(MerchantImageType)),
  })
  declare type: MerchantImageType;

  @ForeignKey(() => Merchant)
  @Column({ allowNull: false, type: DataType.INTEGER })
  declare merchantId: number;

  @BelongsTo(() => Merchant)
  declare merchant: Merchant;
}
