import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Topping, ToppingGroup } from 'src/models';
import { CreateToppingDto } from './dto/create-topping.dto';
import { UpdateToppingDto } from './dto/update-topping.dto';

@Injectable()
export class ToppingService {
  constructor(
    @InjectModel(Topping)
    private readonly modelTopping: typeof Topping,
    @InjectModel(ToppingGroup)
    private readonly modelToppingGroup: typeof ToppingGroup,
  ) {}

  // Thêm topping vào nhóm topping
  async createTopping(createToppingDto: CreateToppingDto): Promise<Topping> {
    const group = await this.modelToppingGroup.findByPk(
      createToppingDto.topping_group_id,
    );
    if (!group) throw new BadRequestException('Nhóm topping không tồn tại');
    return await this.modelTopping.create(createToppingDto as any);
  }

  // Cập nhật topping vào nhóm topping
  async updateTopping(
    id: number,
    topping_group_id: number,
    updateToppingDto: UpdateToppingDto,
  ): Promise<Topping> {
    const topping = await this.findOneTopping(id, topping_group_id);
    return await topping.update(updateToppingDto as any);
  }

  // Xóa topping
  async removeTopping(id: number, topping_group_id: number): Promise<void> {
    const topping = await this.findOneTopping(id, topping_group_id);
    return await topping.destroy();
  }

  //  Tìm topping
  async findOneTopping(id: number, topping_group_id: number): Promise<Topping> {
    const topping = await this.modelTopping.findOne({
      where: { id, topping_group_id },
    });

    if (!topping)
      throw new BadRequestException('Topping không tồn tại hoặc sai merchant');
    return topping;
  }

  // Xem danh sách topping theo nhóm (Public)
  async findByGroupByCustomer(topping_group_id: number): Promise<Topping[]> {
    return this.modelTopping.findAll({
      where: { topping_group_id, is_active: true },
      order: [
        ['is_default', 'DESC'],
        ['name', 'ASC'],
      ],
    });
  }

  async findByGroupByMerchant(topping_group_id: number): Promise<Topping[]> {
    return this.modelTopping.findAll({
      where: { topping_group_id },
      order: [
        ['is_default', 'DESC'],
        ['name', 'ASC'],
      ],
    });
  }

  // Kiểm tra danh sách topping có tồn tại
  async existedTopping(toppingsId: number[]) {
    const result = await this.modelTopping.findAll({
      where: { id: { [Op.in]: toppingsId } },
      attributes: ['id'],
      raw: true,
    });

    const idsResult = result.map((t) => t.id);
    const idNotExisted = toppingsId.filter((id) => !idsResult.includes(id));

    if (idNotExisted.length > 0) {
      throw new BadRequestException(
        `Topping với id ${idNotExisted.join(', ')} không tồn tại!`,
      );
    }
  }
}
