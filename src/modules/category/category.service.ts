import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Category } from 'src/models';
import { CreateCategoryDTO } from './dto/create-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category) private readonly categoryModel: typeof Category,
  ) {}

  async findAll() {
    return await this.categoryModel.findAll();
  }

  async create(createCategoryDTO: CreateCategoryDTO) {
    return await this.categoryModel.create(createCategoryDTO as any);
  }
}
