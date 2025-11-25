import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  Category,
  Product,
  ProductToppingGroup,
  Topping,
  ToppingGroup,
} from 'src/models';
import { CategoryModule } from '../category/category.module';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  controllers: [ProductController],
  providers: [ProductService],
  imports: [
    SequelizeModule.forFeature([
      Category,
      Product,
      Topping,
      ToppingGroup,
      ProductToppingGroup,
    ]),
    CategoryModule,
    CloudinaryModule
  ],
  exports: [ProductService]
})
export class ProductModule {}
