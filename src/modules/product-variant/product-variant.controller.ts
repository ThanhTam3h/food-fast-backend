import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { Public } from 'src/common/decorators/global-guard';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { ProductVariantService } from './product-variant.service';

@Controller('product-variant')
export class ProductVariantController {
  constructor(private readonly service: ProductVariantService) {}

  @Public()
  @Post()
  async create(@Body() createProductVariantDto: CreateProductVariantDto) {
    return this.service.create(createProductVariantDto);
  }

  //  FIND ONE
  @Public()
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  //  UPDATE - chỉ merchant
  @Public()
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateProductVariantDto: UpdateProductVariantDto,
  ) {
    return this.service.update(id, updateProductVariantDto);
  }

  //  DELETE - chỉ merchant
  @Public()
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
}
