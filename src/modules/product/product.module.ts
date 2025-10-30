import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  Category,
  Product,
  ProductTopping,
  ProductVariant,
  Topping,
} from 'src/models';
import { CategoryModule } from '../category/category.module';
import { ProductToppingModule } from '../product-topping/product-topping.module';
import { ProductVariantModule } from '../product-variant/product-variant.module';
import { ToppingModule } from '../topping/topping.module';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  controllers: [ProductController],
  providers: [ProductService],
  imports: [
    SequelizeModule.forFeature([
      Category,
      ProductTopping,
      ProductVariant,
      Product,
      Topping,
    ]),
    CategoryModule,
    ProductVariantModule,
    ProductToppingModule,
    ToppingModule,
  ],
  exports: [ProductService]
})
export class ProductModule {}
