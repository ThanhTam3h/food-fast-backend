import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ProductVariant } from 'src/models';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';

@Injectable()
export class ProductVariantService {
  constructor(
    @InjectModel(ProductVariant)
    private readonly modelProductVariant: typeof ProductVariant,
  ) {}

  async create(createProductVariant: CreateProductVariantDto) {
    const existed = await this.modelProductVariant.findOne({
      where: {
        productId: createProductVariant.productId,
        size: createProductVariant.size,
        type: createProductVariant.type,
      },
    });
    if (existed) throw new BadRequestException('Biến thể đã tồn tại');

    const variant = await this.modelProductVariant.create(
      createProductVariant as any,
    );
    return { message: 'Tạo biến thể thành công', data: variant };
  }

  async findOne(id: number) {
    const variant = await this.modelProductVariant.findByPk(id);
    if (!variant) throw new NotFoundException('Không tìm thấy Product Variant');
    return { data: variant };
  }

  async findOneProductVariant(idProductVariant: number, idProduct: number) {
    const result = await this.modelProductVariant.findOne({
      where: { id: idProductVariant, productId: idProduct },
    });
    if (result === null)
      throw new BadRequestException('Product Variant chưa được tìm thấy');
    return {
      data: result,
    };
  }

  async existedProductVanriantDB(
    productId: number,
    size: string,
    type: string,
  ) {
    return await this.modelProductVariant.findOne({
      where: {
        productId: productId,
        size: size,
        type: type,
      },
    });
  }

  async update(id: number, updateProductVariantDto: UpdateProductVariantDto) {
    const variant = await this.modelProductVariant.findByPk(id);
    if (!variant) throw new NotFoundException('Không tìm thấy Product Variant');
    await variant.update(updateProductVariantDto);
    return { message: 'Cập nhật thành công', data: variant };
  }

  async remove(id: number) {
    const variant = await this.modelProductVariant.findByPk(id);
    if (!variant) throw new NotFoundException('Không tìm thấy Product Variant');
    await variant.destroy();
    return { message: 'Xóa biến thể thành công' };
  }

  async findById(id: number) {
    return await this.modelProductVariant.findByPk(id);
  }
}
