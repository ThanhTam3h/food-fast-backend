import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Address, Merchant, MerchantImage, User, UserRole } from 'src/models';
import { AddressModule } from '../address/address.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { MerchantController } from './merchant.controller';
import { MerchantService } from './merchant.service';

@Module({
  controllers: [MerchantController],
  providers: [MerchantService],
  imports: [
    SequelizeModule.forFeature([
      Merchant,
      User,
      UserRole,
      MerchantImage,
      Address,
    ]),
    HttpModule,
    CloudinaryModule,
    AddressModule,
  ],
  exports: [MerchantService],
})
export class MerchantModule {}
