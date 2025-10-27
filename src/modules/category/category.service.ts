import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Category } from 'src/models/category.model';
import { CreateCategoryDTO } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category) private readonly categoryModel: typeof Category,
  ) {}

  async createCategory(dto: CreateCategoryDTO) {
    const category = await this.categoryModel.create(dto as any);
    return category;
  }

  async findAllCategory(merchantId?: number) {
    if (merchantId) {
      return this.categoryModel.findAll({ where: { merchantId } });
    }
    return this.categoryModel.findAll();
  }

  async findOneCategory(id: number) {
    const category = await this.categoryModel.findByPk(id, {
      include: ['products', 'toppings', 'merchant'],
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async updateCategory(id: number, dto: UpdateCategoryDto) {
    const category = await this.categoryModel.findByPk(id);
    if (!category) throw new NotFoundException('Category not found');
    await category.update(dto);
    return category;
  }

  async deleteCategory(id: number) {
    const category = await this.categoryModel.findByPk(id);
    if (!category) throw new NotFoundException('Category not found');
    await category.destroy();
    return { message: 'Category deleted successfully' };
  }
}
