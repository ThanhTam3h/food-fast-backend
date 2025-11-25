import { ConfigService } from '@nestjs/config';
import { SequelizeModuleOptions } from '@nestjs/sequelize';
import { Dialect } from 'sequelize';
import {
  Address,
  Cart,
  CartItem,
  CartItemTopping,
  Category,
  Merchant,
  MerchantImage,
  Order,
  OrderItem,
  OrderItemTopping,
  Permission,
  Product,
  Role,
  RolePermission,
  Topping,
  User,
  UserRole,
  ProductToppingGroup,
  ToppingGroup,
  Drone,
  DroneHub,
} from 'src/models';

export const sequelizeConfig = (
  configService: ConfigService,
): SequelizeModuleOptions => ({
  // Quan trọng: dùng URL
  url: configService.get<string>('postgresql://neondb_owner:yourpassword@ep-snowy-snow-a116r8uj-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'),

  dialect: 'postgres',
  synchronize: false,
  autoLoadModels: true,
  logging: false,

  models: [
    Topping,
    Address,
    User,
    Merchant,
    MerchantImage,
    Role,
    Permission,
    Category,
    Product,
    ToppingGroup,
    ProductToppingGroup,
    Order,
    Cart,
    UserRole,
    RolePermission,
    OrderItem,
    OrderItemTopping,
    CartItem,
    CartItemTopping,
    DroneHub,
    Drone,
  ],

  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});
