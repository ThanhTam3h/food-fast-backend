import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Public } from 'src/common/decorators/global-guard';
import { CreateProductDto } from './dto/create-product.dto';
import { filterProductDto } from './dto/filter-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Public()
  @Post('/create')
  async createProduct(@Body() createData: CreateProductDto) {
    return this.productService.createProduct(createData);
  }

  @Public()
  @Get('/getone/:id')
  async getOneProduct(@Param('id') id: number) {
    return await this.productService.findOneProductById(id);
  }

  @Public()
  @Get('/getall')
  async getAllProduct(@Query() filterSearch: filterProductDto) {
    return await this.productService.findAllProducts(filterSearch);
  }

  @Public()
  @Delete('/softdelete/:id')
  async softDeleteProduct(@Param('id') id: number) {
    return await this.productService.softDeteleProduct(id);
  }

  @Public()
  @Delete('/harddelete/:id')
  async hardDeleteProduct(@Param('id') id: number) {
    return await this.productService.hardDeleteProduct(id);
  }

  @Public()
  @Put('/update/:id')
  async updateProduct(
    @Param('id') id: number,
    @Body() updateData: UpdateProductDto,
  ) {
    return await this.productService.updateProduct(id, updateData);
  }
}
