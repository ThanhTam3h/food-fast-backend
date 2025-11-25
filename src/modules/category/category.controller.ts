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
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/global-guard';
import { CategoryService } from './category.service';
import { CreateCategoryDTO } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('Category')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // @UseGuards(JWTAuthGuard)
  @Public()
  @Post('')
  // @ApiBearerAuth('access-token')
  @ApiBody({ type: CreateCategoryDTO })
  async create(@Body() createCategoryDTO: CreateCategoryDTO) {
    return await this.categoryService.createCategory(createCategoryDTO);
  }

  @Public()
  @Get('')
  @ApiQuery({ name: 'merchantId', required: false })
  async findAll(@Query('merchantId') merchantId?: number) {
    return await this.categoryService.findAllCategory(Number(merchantId));
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.categoryService.findOneCategory(id);
  }

  @Public()
  @Patch(':id')
  // @ApiBearerAuth('access-token')
  async update(
    @Param('id') id: number,
    @Body() createCategoryDTO: UpdateCategoryDto,
  ) {
    return await this.categoryService.updateCategory(id, createCategoryDTO);
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  async remove(@Param('id') id: number) {
    return await this.categoryService.deleteCategory(id);
  }
}
