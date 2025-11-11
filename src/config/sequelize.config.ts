import { ConfigService } from '@nestjs/config';
import { SequelizeModuleOptions } from '@nestjs/sequelize';
import { Dialect } from 'sequelize';
import { Address } from 'src/models/address.model';
import { Cart } from 'src/models/cart.model';
import { CartItem } from 'src/models/cart_item.model';
import { CartItemTopping } from 'src/models/cart_item_topping.model';
import { Category } from 'src/models/category.model';
import { Merchant } from 'src/models/merchant.model';
import { Order } from 'src/models/order.model';
import { OrderItem } from 'src/models/order_item.model';
import { OrderItemTopping } from 'src/models/order_item_topping.model';
import { Permission } from 'src/models/permission.model';
import { Product } from 'src/models/product.model';
import { Role } from 'src/models/role.model';
import { RolePermission } from 'src/models/role_permission.model';
import { Topping } from 'src/models/topping.model';
import { User } from 'src/models/user.model';
import { UserRole } from 'src/models/user_role.model';

import {
  Drone,
  DroneHub,
  MerchantImage,
  ProductToppingGroup,
  ToppingGroup,
} from 'src/models';

export const sequelizeConfig = (
  configService: ConfigService,
): SequelizeModuleOptions => ({
  database: configService.get<string>('DB_NAME'),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT')
    ? Number(configService.get<number>('DB_PORT'))
    : 5432,
  dialect: configService.get<Dialect>('DB_DIALECT') ?? 'postgres',
  synchronize: true,
  models: [
    // Cha
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
  autoLoadModels: true,
  logging: false,
});
