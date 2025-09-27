import { Controller } from '@nestjs/common';
import { DroneService } from './drone.service';

@Controller('drone')
export class DroneController {
  constructor(private readonly droneService: DroneService) {}
}
