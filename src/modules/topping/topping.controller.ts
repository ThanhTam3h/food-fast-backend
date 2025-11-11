import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/global-guard';
import { Topping } from 'src/models';
import { CreateToppingDto } from './dto/create-topping.dto';
import { UpdateToppingDto } from './dto/update-topping.dto';
import { ToppingService } from './topping.service';

@ApiTags('Topping')
@Controller('topping')
export class ToppingController {
  constructor(private readonly toppingService: ToppingService) {}

  @Public()
  @Post('create')
  async create(@Body() createToppingDto: CreateToppingDto): Promise<Topping> {
    return await this.toppingService.createTopping(createToppingDto);
  }

  @Public()
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Query('groupId') groupId: number,
    @Body() updateToppingDto: UpdateToppingDto,
  ): Promise<Topping> {
    return await this.toppingService.updateTopping(
      id,
      groupId,
      updateToppingDto,
    );
  }

  @Public()
  @Delete(':id')
  async remove(
    @Param('id') id: number,
    @Query('groupId') groupId: number,
  ): Promise<{ message: string }> {
    await this.toppingService.removeTopping(id, groupId);
    return { message: 'Đã xoá topping thành công' };
  }

  @Public()
  @Get('group/:groupId')
  async findByGroupByCustomer(
    @Param('groupId') groupId: number,
  ): Promise<Topping[]> {
    return await this.toppingService.findByGroupByCustomer(groupId);
  }

  @Public()
  @Get(':groupId')
  async findByGroupByMerchant(
    @Param('groupId') groupId: number,
  ): Promise<Topping[]> {
    return await this.toppingService.findByGroupByMerchant(groupId);
  }
}
