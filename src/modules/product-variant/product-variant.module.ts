import { Module } from '@nestjs/common';
import { ProductVariantService } from './product-variant.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProductVariant } from 'src/models/product_variant.model';
import { ProductVariantController } from './product-variant.controller';

@Module({
  providers: [ProductVariantService],
  imports: [SequelizeModule.forFeature([ProductVariant])],
  exports: [ProductVariantService],
  controllers: [ProductVariantController]
})
export class ProductVariantModule {}
