import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JWTAuthGuard } from '../auth/guards/jwt.guard';
import { CategoryService } from './category.service';
import { CreateCategoryDTO } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Public } from 'src/common/decorators/global-guard';

@ApiTags('Category')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @UseGuards(JWTAuthGuard)
  @Post()
  @ApiBearerAuth('access-token')
  @ApiBody({ type: CreateCategoryDTO })
  async create(@Body() createCategoryDTO: CreateCategoryDTO) {
    return this.categoryService.createCategory(createCategoryDTO);
  }

  @Public()
  @Get()
  @ApiQuery({ name: 'merchantId', required: false })
  async findAll(@Query('merchantId') merchantId?: number) {
    return this.categoryService.findAllCategory(merchantId);
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.categoryService.findOneCategory(id);
  }

  @UseGuards(JWTAuthGuard)
  @Patch(':id')
  @ApiBearerAuth('access-token')
  async update(
    @Param('id') id: number,
    @Body() createCategoryDTO: UpdateCategoryDto,
  ) {
    return await this.categoryService.updateCategory(id, createCategoryDTO);
  }

  @UseGuards(JWTAuthGuard)
  @Delete(':id')
  @ApiBearerAuth('access-token')
  async remove(@Param('id') id: number) {
    return await this.categoryService.deleteCategory(id);
  }
}
