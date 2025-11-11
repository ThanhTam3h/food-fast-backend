import { Module } from '@nestjs/common';
import { ToppingService } from './topping.service';
import { ToppingController } from './topping.controller';
import { Topping, ToppingGroup } from 'src/models';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  controllers: [ToppingController],
  providers: [ToppingService],
  imports: [SequelizeModule.forFeature([Topping, ToppingGroup])],
  exports: [ToppingService]
})
export class ToppingModule {}
