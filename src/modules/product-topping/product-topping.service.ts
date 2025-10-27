
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { ProductTopping } from 'src/models';

@Injectable()
export class ProductToppingService {
  constructor(
    @InjectModel(ProductTopping)
    private readonly modelProductTopping: typeof ProductTopping,
  ) {}

  async existedProductTopping(productToppingsId: number[]) {
    const result = await this.modelProductTopping.findAll({
      where: {
        id: {
          [Op.in]: productToppingsId,
        },
      },
      attributes: ['id'], // Chỉ lấy ID thay vì tất cả columns
      raw: true,
    });
    const idsResult = result.map((Topping) => Topping.id);
    const idNotExsited = productToppingsId.filter(
      (id) => !idsResult.includes(id),
    );
    if (idNotExsited.length > 0) {
      throw new BadRequestException(
        `ProductTopping with id ${idNotExsited} not found!!!`,
      );
    }
  }
}
