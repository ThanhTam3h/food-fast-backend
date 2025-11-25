import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateToppingGroupDto } from './dto/create-topping-group.dto';
import { UpdateToppingGroupDto } from './dto/update-topping-group.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Topping, ToppingGroup } from 'src/models';
import { CreateToppingDto } from '../topping/dto/create-topping.dto';

@Injectable()
export class ToppingGroupService {
  constructor(
    @InjectModel(ToppingGroup)
    private readonly toppingGroupModel: typeof ToppingGroup,
    @InjectModel(Topping)
    private readonly toppingModel: typeof Topping,
  ) {}

  // async createToppingGroup(createToppingGroupDto: CreateToppingGroupDto) {
  //   return await this.toppingGroupModel.create(createToppingGroupDto as any);
  // }

  // async findAll(merchantId: number) {
  //   return await this.toppingGroupModel.findAll({
  //     where: { merchantId },
  //     include: { all: true },
  //     order: [['id', 'DESC']],
  //   });
  // }

  // async updateToppingGroup(
  //   id: number,
  //   updateToppingGroupDto: UpdateToppingGroupDto,
  // ) {
  //   const group = await this.toppingGroupModel.findByPk(id);
  //   if (!group) throw new NotFoundException('Topping group not found');

  //   await group.update(updateToppingGroupDto as any);
  //   return group;
  // }

  // async removeToppingGroup(id: number) {
  //   const group = await this.toppingGroupModel.findByPk(id);
  //   if (!group) throw new NotFoundException('Topping group not found');

  //   await group.destroy();
  //   return { message: 'Topping group deleted successfully' };
  // }

  // ===== CREATE GROUP + TOPPINGS =====
  async createToppingGroup(dto: CreateToppingGroupDto) {
    const group = await this.toppingGroupModel.create({
      name: dto.name,
      is_required: dto.is_required,
      minSelection: dto.minSelection,
      maxSelection: dto.maxSelection,
      merchantId: dto.merchantId,
    } as any);

    // Nếu có toppings đi kèm
    if (dto.toppings && dto.toppings.length > 0) {
      const toppingsData: CreateToppingDto[] = dto.toppings.map((t) => ({
        ...t,
        topping_group_id: group.id,
      }));

      await this.toppingModel.bulkCreate(toppingsData as any);
    }

    // Trả về group + toppings
    return await this.toppingGroupModel.findByPk(group.id, {
      include: { all: true },
    });
  }

  // ===== UPDATE GROUP + TOPPINGS =====
  async updateToppingGroup(id: number, dto: UpdateToppingGroupDto) {
    const group = await this.toppingGroupModel.findByPk(id, {
      include: { all: true },
    });
    if (!group) throw new NotFoundException('Topping group not found');

    await group.update(dto as any);

    // Nếu có toppings update hoặc thêm mới
    if (dto.toppings && dto.toppings.length > 0) {
      for (const t of dto.toppings) {
        if (t.id) {
          // Update topping đã có
          const topping = await this.toppingModel.findByPk(t.id);
          if (!topping)
            throw new BadRequestException(`Topping id ${t.id} không tồn tại`);
          await topping.update(t);
        } else {
          // Thêm topping mới
          await this.toppingModel.create({ ...t, topping_group_id: group.id } as any);
        }
      }
    }

    return await this.toppingGroupModel.findByPk(id, {
      include: { all: true },
    });
  }

  // ===== FIND ALL BY MERCHANT =====
  async findAll(merchantId: number) {
    return await this.toppingGroupModel.findAll({
      where: { merchantId },
      include: { all: true },
      order: [['id', 'DESC']],
    });
  }

  // ===== REMOVE GROUP =====
  async removeToppingGroup(id: number) {
    const group = await this.toppingGroupModel.findByPk(id);
    if (!group) throw new NotFoundException('Topping group not found');

    await this.toppingModel.destroy({ where: { topping_group_id: id } });
    await group.destroy();

    return { message: 'Topping group deleted successfully' };
  }
}
