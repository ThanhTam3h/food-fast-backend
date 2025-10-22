import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDTO } from './dto/create-category.dto';
import { LocalAuthGuard } from '../auth/guards/local-auth.guard';
import { JWTAuthGuard } from '../auth/guards/jwt.guard';
import { Public } from 'src/common/decorators/global-guard';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }
  @Public()
  @Get('/')
  async findAllCategories() {
    return await this.categoryService.findAll();
  }

  @Post('create')
  async createCategory(@Body() createCategoryDTO: CreateCategoryDTO) {
    return await this.categoryService.create(createCategoryDTO);
  }
}
