import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Public } from 'src/common/decorators/global-guard';
import { DroneService } from './drone.service';
import { CreateDroneDto } from './dto/create-drone.dto';
import { UpdateDroneDto } from './dto/update-drone.dto';

@Controller('drone')
export class DroneController {
  constructor(private readonly droneService: DroneService) {}

  @Public()
  @Post()
  create(@Body() createDroneDto: CreateDroneDto) {
    return this.droneService.create(createDroneDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.droneService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.droneService.findOne(+id);
  }

  @Public()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDroneDto: UpdateDroneDto) {
    return this.droneService.update(+id, updateDroneDto);
  }

  @Public()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.droneService.remove(+id);
  }
}
