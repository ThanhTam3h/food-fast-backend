import { Module } from '@nestjs/common';
import { DroneService } from './drone.service';
import { DroneController } from './drone.controller';
import { Sequelize } from 'sequelize';
import { SequelizeModule } from '@nestjs/sequelize';
import { Drone, DroneHub } from 'src/models';

@Module({
  controllers: [DroneController],
  providers: [DroneService],
  imports:[SequelizeModule.forFeature([Drone, DroneHub])],
})
export class DroneModule {}
