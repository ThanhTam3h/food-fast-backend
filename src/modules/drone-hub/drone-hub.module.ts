import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DroneHub } from 'src/models';
import { DroneHubController } from './drone-hub.controller';
import { DroneHubService } from './drone-hub.service';

@Module({
  controllers: [DroneHubController],
  providers: [DroneHubService],
  imports: [SequelizeModule.forFeature([DroneHub])],
})
export class DroneHubModule {}
