import { Module } from '@nestjs/common';
import { ProductToppingGroupService } from './product-topping-group.service';
import { ProductToppingGroupController } from './product-topping-group.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Product, ProductToppingGroup, ToppingGroup } from 'src/models';

@Module({
  controllers: [ProductToppingGroupController],
  providers: [ProductToppingGroupService],
  imports: [SequelizeModule.forFeature([ProductToppingGroup, ToppingGroup, Product])],
  exports: [ProductToppingGroupService]
})
export class ProductToppingGroupModule {}
