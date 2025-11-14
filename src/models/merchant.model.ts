import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Address } from './address.model';
import { Cart } from './cart.model';
import { Category } from './category.model';
import { MerchantImage } from './merchant_image.model';
import { Order } from './order.model';
import { Product } from './product.model';
import { ToppingGroup } from './topping_group.model';
import { User } from './user.model';
import { UserRole } from './user_role.model';

export enum MerchantStatus {
  PENDING = 'PENDING',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  OPENING = 'OPENING',
  LOCKED = 'LOCKED',
}

@Table
export class Merchant extends Model<Merchant> {
  @ForeignKey(() => User)
  @Column({ allowNull: true, type: DataType.INTEGER })
  declare ownerId: number;

  @BelongsTo(() => User)
  declare owner: User;

  @Column({ allowNull: false, type: DataType.STRING })
  declare name: string;

  @Column({ allowNull: true, type: DataType.STRING })
  declare representativeName: string;

  @Column({ allowNull: true, type: DataType.TEXT })
  declare description: string;

  @ForeignKey(() => Address)
  @Column({ allowNull: true, type: DataType.INTEGER })
  declare addressId: number;

  @BelongsTo(() => Address)
  declare address: Address;

  @Column({ allowNull: true, type: DataType.STRING })
  declare representativeEmail: string;

  @Column({ allowNull: true, type: DataType.STRING })
  declare representativeMobile: string;

  @Column({ allowNull: true, type: DataType.STRING })
  declare openingHours: string;

  @Column({ defaultValue: false, type: DataType.BOOLEAN })
  declare is_temporarily_closed: boolean;

  // bỏ
  @Column({ allowNull: true, type: DataType.STRING })
  declare image: string;

  // bỏ
  @Column({ defaultValue: true, type: DataType.BOOLEAN })
  declare open: boolean;

  @Column({ allowNull: true, type: DataType.STRING })
  declare businessModel: string;

  @Column({ allowNull: true, type: DataType.INTEGER })
  declare dailyOrderVolume: number;

  @Column({ allowNull: true, type: DataType.STRING })
  declare registrationType: string;

  @Column({ allowNull: true, type: DataType.STRING })
  declare legalBusinessName: string;

  @Column({ allowNull: true, type: DataType.STRING })
  declare businessRegistrationCode: string;

  @Column({ allowNull: true, type: DataType.DATEONLY })
  declare registrationDate: Date;

  @Column({ allowNull: true, type: DataType.STRING })
  declare businessIndustry: string;

  @Column({ allowNull: true, type: DataType.STRING })
  declare bankName: string;

  @Column({ allowNull: true, type: DataType.STRING })
  declare bankAccountNumber: string;

  @Column({ allowNull: true, type: DataType.STRING })
  declare bankAccountHolderName: string;

  // Owner info
  @Column({ allowNull: true, type: DataType.STRING })
  declare ownerName: string;

  @Column({ allowNull: true, type: DataType.DATEONLY })
  declare ownerDateOfBirth: Date;

  @Column({ allowNull: true, type: DataType.STRING })
  declare ownerIdNumber: string;

  @Column({ allowNull: true, type: DataType.DATEONLY })
  declare ownerIdIssueDate: Date;

  @Column({ allowNull: true, type: DataType.STRING })
  declare ownerIdIssuePlace: string;

  @Column({ allowNull: true, type: DataType.DATEONLY })
  declare ownerIdExpiryDate: Date;

  @Column({ allowNull: true, type: DataType.STRING })
  declare ownerPermanentAddress: string;

  @Column({ allowNull: true, type: DataType.STRING })
  declare ownerCountry: string;

  @Column({ allowNull: true, type: DataType.STRING })
  declare ownerCity: string;

  @Column({ allowNull: true, type: DataType.STRING })
  declare ownerCurrentAddress: string;

  // Restaurant / Merchant contact
  @Column({ allowNull: true, type: DataType.STRING })
  declare merchantEmail: string;

  @Column({ allowNull: true, type: DataType.STRING })
  declare merchantPhoneNumber: string;

  @Column({
    allowNull: false,
    type: DataType.ENUM(...Object.values(MerchantStatus)),
    defaultValue: MerchantStatus.PENDING,
  })
  declare status: MerchantStatus;

  @HasMany(() => Product)
  declare products: Product[];

  @HasMany(() => Order)
  declare orders: Order[];

  @HasMany(() => Cart)
  declare carts: Cart[];

  @HasMany(() => Category)
  declare categories: Category[];

  @HasMany(() => ToppingGroup)
  declare toppingGroups: ToppingGroup[];

  @HasMany(() => UserRole)
  declare userRoles: UserRole[];

  @HasMany(() => MerchantImage)
  declare merchantImages: MerchantImage[];
}
