import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Product, ProductToppingGroup, ToppingGroup } from 'src/models';
import { RemoveGroupFromProductDto } from './dto/remove-group-from-product.dto';
import { AddGroupToProductDto } from './dto/add-group-to-product.dto';

@Injectable()
export class ProductToppingGroupService {
  constructor(
    @InjectModel(ProductToppingGroup)
    private readonly modelProductToppingGroup: typeof ProductToppingGroup,

    @InjectModel(Product)
    private readonly modelProduct: typeof Product,

    @InjectModel(ToppingGroup)
    private readonly modelToppingGroup: typeof ToppingGroup,
  ) {}

  async checkToppingGroupExists(productId: number, toppingGroupId: number) {
    const exists = await this.modelProductToppingGroup.findOne({
      where: { productId, toppingGroupId },
    });
    return !!exists;
  }

  async linkToppingGroups(addGroupToProductDto: AddGroupToProductDto) {
    const { productId, toppingGroupIds } = addGroupToProductDto;

    const product = await this.modelProduct.findByPk(productId);
    if (!product) throw new BadRequestException('Sản phẩm không tồn tại');

    const groups = await this.modelToppingGroup.findAll({
      where: { id: toppingGroupIds },
    });

    if (groups.length !== toppingGroupIds.length) {
      throw new BadRequestException(
        'Một hoặc nhiều nhóm topping không tồn tại',
      );
    }

    const created: ProductToppingGroup[] = [];
    for (const groupId of toppingGroupIds) {
      const alreadyLinked = await this.checkToppingGroupExists(
        productId,
        groupId,
      );
      if (!alreadyLinked) {
        const link = await this.modelProductToppingGroup.create({
          productId,
          toppingGroupId: groupId,
        } as any);
        created.push(link);
      }
    }

    return created;
  }

  async unlinkToppingGroup(
    removeGroupFromProductDto: RemoveGroupFromProductDto,
  ) {
    const { productId, toppingGroupId } = removeGroupFromProductDto;

    const record = await this.modelProductToppingGroup.findOne({
      where: { productId, toppingGroupId },
    });

    if (!record) {
      throw new BadRequestException(
        'Nhóm topping không được liên kết với sản phẩm này',
      );
    }

    await record.destroy();
    return { message: 'Đã gỡ liên kết nhóm topping khỏi sản phẩm' };
  }
}
