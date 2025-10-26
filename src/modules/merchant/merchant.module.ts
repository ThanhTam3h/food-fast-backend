import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Merchant, User, UserRole } from 'src/models';
import { MerchantController } from './merchant.controller';
import { MerchantService } from './merchant.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [MerchantController],
  providers: [MerchantService],
  imports: [SequelizeModule.forFeature([Merchant, User, UserRole]), HttpModule],
  exports: [MerchantService]
})
export class MerchantModule {}
