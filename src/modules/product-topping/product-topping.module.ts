import { Module } from '@nestjs/common';
import { ProductToppingService } from './product-topping.service';
import { ProductToppingController } from './product-topping.controller';
import { ProductTopping } from 'src/models';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  controllers: [ProductToppingController],
  providers: [ProductToppingService],
  imports: [SequelizeModule.forFeature([ProductTopping])],
  exports: [ProductToppingService]
})
export class ProductToppingModule {}
