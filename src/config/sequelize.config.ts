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
import { ProductTopping } from 'src/models/product_topping.model';
import { ProductVariant } from 'src/models/product_variant.model';
import { Role } from 'src/models/role.model';
import { RolePermission } from 'src/models/role_permission.model';
import { Shipment } from 'src/models/shipment.model';
import { Topping } from 'src/models/topping.model';
import { User } from 'src/models/user.model';
import { UserRole } from 'src/models/user_role.model';

import { Drone, DroneTelemetry } from 'src/models';

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
    User,
    Merchant,
    Role,
    Permission,
    Category,
    Product,
    Topping,
    Order,
    Cart,
    Shipment,
    Address,
    ProductVariant,
    ProductTopping,
    UserRole,
    RolePermission,
    OrderItem,
    OrderItemTopping,
    CartItem,
    CartItemTopping,
    Drone,
    DroneTelemetry,
  ],
  autoLoadModels: true,
  logging: false,
});
