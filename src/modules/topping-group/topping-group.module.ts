import { Module } from '@nestjs/common';
import { ToppingGroupService } from './topping-group.service';
import { ToppingGroupController } from './topping-group.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { ToppingGroup } from 'src/models';

@Module({
  controllers: [ToppingGroupController],
  providers: [ToppingGroupService],
  exports: [ToppingGroupService],
  imports: [SequelizeModule.forFeature([ToppingGroup])]
})
export class ToppingGroupModule {}
