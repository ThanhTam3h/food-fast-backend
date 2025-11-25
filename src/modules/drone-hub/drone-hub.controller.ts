import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { CreateDroneHubDto } from './dto/create-dronehub.dto';
import { UpdateDroneHubDto } from './dto/update-dronehub.dto';
import { DroneHubService } from './drone-hub.service';
import { Public } from 'src/common/decorators/global-guard';

@Controller('drone-hubs')
export class DroneHubController {
  constructor(private readonly droneHubService: DroneHubService) {}

  @Public()
  @Post()
  create(@Body() createDroneHubDto: CreateDroneHubDto) {
    return this.droneHubService.create(createDroneHubDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.droneHubService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.droneHubService.findOne(+id);
  }

  @Public()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDroneHubDto: UpdateDroneHubDto,
  ) {
    return this.droneHubService.update(+id, updateDroneHubDto);
  }

  @Public()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.droneHubService.remove(+id);
  }
}
