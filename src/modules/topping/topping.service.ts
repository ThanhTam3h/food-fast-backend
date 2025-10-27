import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Topping } from 'src/models';
import { CreateToppingDto } from './dto/create-topping.dto';
import { UpdateToppingDto } from './dto/update-topping.dto';

@Injectable()
export class ToppingService {
  constructor(
    @InjectModel(Topping)
    private readonly modelTopping: typeof Topping,
  ) {}

  // Tìm topping theo id & merchantId (đảm bảo bảo mật)
  async findOneTopping(id: number, merchantId: number) {
    const result = await this.modelTopping.findOne({
      where: { id, merchantId },
    });
    if (!result)
      throw new BadRequestException(
        'Topping không tồn tại hoặc không thuộc về merchant này',
      );
    return result;
  }

  // Kiểm tra danh sách topping có tồn tại (dùng trong order)
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

  // Tạo topping mới (merchantId phải truyền vào DTO)
  async createTopping(createToppingDto: CreateToppingDto) {
    if (!createToppingDto.merchantId)
      throw new BadRequestException('Thiếu merchantId');
    return this.modelTopping.create(createToppingDto as any);
  }

  // Lấy tất cả topping của merchant
  async findAllByMerchant(merchantId: number): Promise<Topping[]> {
    return this.modelTopping.findAll({
      where: { merchantId },
      include: { all: true },
      order: [['createdAt', 'DESC']],
    });
  }

  // Cập nhật topping (chỉ merchant chủ sở hữu được phép)
  async update(
    id: number,
    merchantId: number,
    updateToppingDto: UpdateToppingDto,
  ): Promise<Topping> {
    const topping = await this.findOneTopping(id, merchantId);
    await topping.update(updateToppingDto as any);
    return topping;
  }

  // Xoá topping (merchant phải đúng)
  async remove(id: number, merchantId: number): Promise<void> {
    const topping = await this.findOneTopping(id, merchantId);
    await topping.destroy();
  }
}
