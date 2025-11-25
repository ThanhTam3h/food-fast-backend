import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
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
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async createProduct(
    @UploadedFile() file: Express.Multer.File,
    @Body() createData: CreateProductDto,
  ) {
    console.log('File received:', file);
    console.log('DTO received:', createData);

    return this.productService.createProduct(createData, file);
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
  @Patch('/update/:id')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async updateProduct(
    @Param('id') id: number,
    @Body() updateData: UpdateProductDto,
    @Body('isActive', new ParseBoolPipe()) isActive: boolean,
    @UploadedFile() file: Express.Multer.File,
  ) {
    updateData.isActive = isActive;
    console.log(isActive, updateData.isActive)
    console.log('File nhận được:', file?.originalname);
    return this.productService.updateProduct(+id, updateData, file);
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
}
