import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ToppingGroupService } from './topping-group.service';
import { CreateToppingGroupDto } from './dto/create-topping-group.dto';
import { UpdateToppingGroupDto } from './dto/update-topping-group.dto';
import { Public } from 'src/common/decorators/global-guard';

@Controller('topping-group')
export class ToppingGroupController {
  constructor(private readonly toppingGroupService: ToppingGroupService) {}

  @Public()
  @Post()
  async createToppingGroup(@Body() dto: CreateToppingGroupDto) {
    return this.toppingGroupService.createToppingGroup(dto);
  }

  @Public()
  @Get('merchant/:merchantId')
  async findAllByMerchant(@Param('merchantId') merchantId: number) {
    return this.toppingGroupService.findAll(+merchantId);
  }

  @Public()
  @Patch(':id')
  async update(@Param('id') id: number, @Body() dto: UpdateToppingGroupDto) {
    return this.toppingGroupService.updateToppingGroup(+id, dto);
  }

  @Public()
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.toppingGroupService.removeToppingGroup(+id);
  }
}
