import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { CreateDroneHubDto } from './dto/create-dronehub.dto';
import { UpdateDroneHubDto } from './dto/update-dronehub.dto';
import { DroneHub } from 'src/models';

@Injectable()
export class DroneHubService {
  constructor(
    @InjectModel(DroneHub)
    private readonly droneHubModel: typeof DroneHub,
  ) {}

  async create(createDroneHubDto: CreateDroneHubDto): Promise<DroneHub> {
    return this.droneHubModel.create({
      ...createDroneHubDto,
      location: {
        type: 'Point',
        coordinates: createDroneHubDto.location.coordinates,
      },
    } as any);
  }

  async findAll(): Promise<DroneHub[]> {
    return this.droneHubModel.findAll({ include: { all: true } });
  }

  async findOne(id: number): Promise<DroneHub> {
    const hub = await this.droneHubModel.findByPk(id, {
      include: { all: true },
    });
    if (!hub) throw new NotFoundException(`DroneHub with id ${id} not found`);
    return hub;
  }

  async update(
    id: number,
    updateDroneHubDto: UpdateDroneHubDto,
  ): Promise<DroneHub> {
    const hub = await this.findOne(id);
    return hub.update(updateDroneHubDto as any);
  }

  async remove(id: number): Promise<void> {
    const hub = await this.findOne(id);
    await hub.destroy();
  }
}
