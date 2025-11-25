import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { CreateDroneDto } from './dto/create-drone.dto';
import { UpdateDroneDto } from './dto/update-drone.dto';
import { Drone, DroneHub } from 'src/models';

@Injectable()
export class DroneService {
  constructor(
    @InjectModel(Drone)
    private readonly droneModel: typeof Drone,
    @InjectModel(DroneHub)
    private readonly droneHubModel: typeof DroneHub,
  ) {}

  async create(createDroneDto: CreateDroneDto): Promise<Drone> {
    return this.droneModel.create(createDroneDto as any);
  }

  async findAll(): Promise<Drone[]> {
   return this.droneModel.findAll({
     include: [
       {
         model: this.droneHubModel,
       },
     ],
   });
  }

  async findOne(id: number): Promise<Drone> {
    const drone = await this.droneModel.findByPk(id, {
      include: { all: true },
    });
    if (!drone) throw new NotFoundException(`Drone with id ${id} not found`);
    return drone;
  }

  async update(id: number, updateDroneDto: UpdateDroneDto): Promise<Drone> {
    const drone = await this.findOne(id);
    return drone.update(updateDroneDto);
  }

  async remove(id: number): Promise<void> {
    const drone = await this.findOne(id);
    await drone.destroy();
  }
}
