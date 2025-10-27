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
    return this.toppingService.createTopping(createToppingDto);
  }

  @Public()
  @Get()
  async findAll(@Query('merchantId') merchantId: number): Promise<Topping[]> {
    return this.toppingService.findAllByMerchant(merchantId);
  }

  @Public()
  @Get(':id')
  async findOne(
    @Param('id') id: number,
    @Query('merchantId') merchantId: number,
  ): Promise<Topping> {
    return this.toppingService.findOneTopping(id, merchantId);
  }

  @Public()
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Query('merchantId') merchantId: number,
    @Body() updateToppingDto: UpdateToppingDto,
  ): Promise<Topping> {
    return this.toppingService.update(id, merchantId, updateToppingDto);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: number,
    @Query('merchantId') merchantId: number,
  ): Promise<{ message: string }> {
    await this.toppingService.remove(id, merchantId);
    return { message: 'Đã xoá topping thành công' };
  }
}
