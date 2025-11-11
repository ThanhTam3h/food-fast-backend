import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateToppingGroupDto } from './dto/create-topping-group.dto';
import { UpdateToppingGroupDto } from './dto/update-topping-group.dto';
import { InjectModel } from '@nestjs/sequelize';
import { ToppingGroup } from 'src/models';

@Injectable()
export class ToppingGroupService {
  constructor(
    @InjectModel(ToppingGroup)
    private readonly toppingGroupModel: typeof ToppingGroup,
  ) {}

  async createToppingGroup(createToppingGroupDto: CreateToppingGroupDto) {
    return await this.toppingGroupModel.create(createToppingGroupDto as any);
  }

  async findAll(merchantId: number) {
    return await this.toppingGroupModel.findAll({
      where: { merchantId },
      include: { all: true },
      order: [['id', 'DESC']],
    });
  }

  async updateToppingGroup(
    id: number,
    updateToppingGroupDto: UpdateToppingGroupDto,
  ) {
    const group = await this.toppingGroupModel.findByPk(id);
    if (!group) throw new NotFoundException('Topping group not found');

    await group.update(updateToppingGroupDto);
    return group;
  }

  async removeToppingGroup(id: number) {
    const group = await this.toppingGroupModel.findByPk(id);
    if (!group) throw new NotFoundException('Topping group not found');

    await group.destroy();
    return { message: 'Topping group deleted successfully' };
  }
}
