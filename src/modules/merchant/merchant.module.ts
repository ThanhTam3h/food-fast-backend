import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Address, Merchant, MerchantImage, User, UserRole } from 'src/models';
import { MerchantController } from './merchant.controller';
import { MerchantService } from './merchant.service';
import { HttpModule } from '@nestjs/axios';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  controllers: [MerchantController],
  providers: [MerchantService],
  imports: [SequelizeModule.forFeature([Merchant, User, UserRole, MerchantImage, Address]), HttpModule, CloudinaryModule],
  exports: [MerchantService]
})
export class MerchantModule {}
