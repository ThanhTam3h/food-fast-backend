import { Module } from '@nestjs/common';
import { ToppingService } from './topping.service';
import { ToppingController } from './topping.controller';
import { Topping } from 'src/models';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  controllers: [ToppingController],
  providers: [ToppingService],
  imports: [SequelizeModule.forFeature([Topping])],
  exports: [ToppingService]
})
export class ToppingModule {}
