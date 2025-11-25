import {
  BadGatewayException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import {
  Category,
  Product,
  ProductToppingGroup,
  Topping,
  ToppingGroup,
} from 'src/models';
import { CategoryService } from '../category/category.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateProductDto } from './dto/create-product.dto';
import { filterProductDto } from './dto/filter-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product) private readonly modelProduct: typeof Product,
    @InjectModel(ToppingGroup)
    private readonly modelToppingGroup: typeof ToppingGroup,
    @InjectModel(ProductToppingGroup)
    private readonly modelProductToppingGroup: typeof ProductToppingGroup,
    @InjectModel(Topping) private readonly modelTopping: typeof Topping,
    @InjectModel(Category) private readonly modelCategory: typeof Category,
    private readonly categoryService: CategoryService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly sequelize: Sequelize,
  ) {}

  async findOneProductById(id: number) {
    const result = await this.modelProduct.findOne({
      where: { id, isActive: true },

      include: [
        {
          model: this.modelProductToppingGroup,
          include: [
            {
              model: this.modelToppingGroup,
              include: [
                {
                  model: this.modelTopping,
                  attributes: ['id', 'name', 'price'],
                  where: { is_active: true },
                  required: false,
                },
              ],
              attributes: [
                'id',
                'name',
                'is_required',
                'minSelection',
                'maxSelection',
              ],
            },
          ],
        },
        {
          model: this.modelCategory,
          attributes: ['name', 'merchantId'],
        },
      ],
      attributes: ['id', 'name', 'description', 'basePrice', 'image'],
    });
    return result;
  }

  calculateTotalPrice(
    basePrice: number,
    selectedToppings: { price: number }[],
  ) {
    const toppingTotal = selectedToppings.reduce(
      (acc, topping) => acc + topping.price,
      0,
    );
    return basePrice + toppingTotal;
  }

  async previewPrice(productId: number, selectedToppingIds: number[]) {
    const product = await this.findOneProductById(productId);

    if (!product) {
      throw new BadGatewayException('Không tìm thấy sản phẩm');
    }

    // --- Gom tất cả topping của sản phẩm ---
    const allToppings =
      product?.productToppingGroups?.flatMap(
        (group) => group?.toppingGroup?.toppings || [],
      ) || [];

    console.log('Gom tất cả topping của sản phẩm', allToppings);

    // --- Lọc topping người dùng chọn ---
    const selectedToppings = allToppings.filter((t) =>
      selectedToppingIds.includes(t.id),
    );

    console.log('Lọc:', selectedToppingIds);

    // --- Validate theo nhóm topping ---
    for (const group of product?.productToppingGroups || []) {
      const groupToppings = group?.toppingGroup?.toppings || [];
      const chosenInGroup = groupToppings.filter((t) =>
        selectedToppingIds.includes(t.id),
      );

      const { name, is_required, minSelection, maxSelection } =
        group?.toppingGroup || {};

      if (is_required && chosenInGroup.length === 0) {
        throw new BadRequestException(`Nhóm ${name} là bắt buộc phải chọn`);
      }

      if (minSelection && chosenInGroup.length < minSelection) {
        throw new BadRequestException(
          `Nhóm ${name}: phải chọn ít nhất ${minSelection} topping`,
        );
      }

      if (maxSelection && chosenInGroup.length > maxSelection) {
        throw new BadRequestException(
          `Nhóm ${name}: không được chọn quá ${maxSelection} topping`,
        );
      }
    }

    // --- Tính tổng giá ---
    const total = this.calculateTotalPrice(product.basePrice, selectedToppings);

    // --- Trả về dữ liệu ---
    return {
      product: {
        id: product.id,
        name: product.name,
        basePrice: product.basePrice,
        image: product.image,
      },
      toppings: selectedToppings,
      totalPrice: total,
    };
  }

  async createProduct(dto: CreateProductDto, file?: Express.Multer.File) {
    const transaction = await this.sequelize.transaction();
    try {
      const category = await this.categoryService.findOneCategory(
        dto.categoryId,
      );
      if (!category)
        throw new BadRequestException('Không tìm thấy danh mục sản phẩm');

      let imageUrl = dto.image;
      if (file) {
        imageUrl = await this.cloudinaryService.uploadImage(file, 'merchants');
      }

      const product = await this.modelProduct.create(
        {
          name: dto.name,
          description: dto.description,
          basePrice: dto.basePrice,
          image: imageUrl,
          isActive: dto.isActive,
          categoryId: dto.categoryId,
          merchantId: dto.merchantId,
        } as Product,
        { transaction },
      );

      if (dto.productToppingGroups && dto.productToppingGroups.length > 0) {
        const groupIds = dto.productToppingGroups.map((g) => g.toppingGroupId);

        const existedGroups = await this.modelToppingGroup.findAll({
          where: { id: { [Op.in]: groupIds } },
        });
        if (existedGroups.length !== groupIds.length)
          throw new BadRequestException('Có nhóm topping không tồn tại');

        const mapping = groupIds.map((gid) => ({
          productId: product.id,
          toppingGroupId: gid,
        }));

        await this.modelProductToppingGroup.bulkCreate(mapping as any, {
          transaction,
        });
      }

      await transaction.commit();
      return { message: 'Tạo sản phẩm thành công', data: product };
    } catch (err) {
      await transaction.rollback();
      throw new BadGatewayException(err.message);
    }
  }

  async updateProduct(
    id: number,
    dto: UpdateProductDto,
    file?: Express.Multer.File,
  ) {
    const transaction = await this.sequelize.transaction();
    try {
      // 1. Tìm sản phẩm
      const product = await this.modelProduct.findByPk(id, { transaction });
      if (!product) {
        throw new BadRequestException('Không tìm thấy sản phẩm');
      }

      // 2. XỬ LÝ ẢNH – DÙNG ĐÚNG HÀM BẠN ĐÃ CÓ
      let imageUrl = product.image; // giữ ảnh cũ nếu không upload

      if (file) {
        try {
          // Upload ảnh mới lên Cloudinary (dùng đúng hàm bạn có)
          imageUrl = await this.cloudinaryService.uploadImage(
            file,
            'merchants',
          );

          // Xóa ảnh cũ nếu tồn tại và là ảnh Cloudinary
          if (product.image && product.image.includes('cloudinary.com')) {
            await this.cloudinaryService.deleteImageByUrl(product.image);
          }
        } catch (uploadError) {
          console.error('Upload ảnh thất bại:', uploadError);
          throw new BadRequestException(
            'Upload ảnh thất bại. Vui lòng thử lại.',
          );
        }
      }
      // 3. CẬP NHẬT THÔNG TIN SẢN PHẨM
      await this.modelProduct.update(
        {
          name: dto.name ?? product.name,
          description: dto.description ?? product.description,
          image: imageUrl,
          basePrice: dto.basePrice ?? product.basePrice,
          isActive: dto.isActive,
          categoryId: dto.categoryId ?? product.categoryId,
          merchantId: dto.merchantId ?? product.merchantId,
        },
        { where: { id }, transaction },
      );

      // 4. CẬP NHẬT TOPPING GROUPS (xóa cũ → thêm mới)
      if (dto.productToppingGroups !== undefined) {
        await this.modelProductToppingGroup.destroy({
          where: { productId: id },
          transaction,
        });

        if (dto.productToppingGroups.length > 0) {
          const mappings = dto.productToppingGroups.map((item) => ({
            productId: id,
            toppingGroupId: item.toppingGroupId,
          }));

          await this.modelProductToppingGroup.bulkCreate(mappings as any, {
            transaction,
          });
        }
      }

      // 5. Commit và trả về kết quả
      await transaction.commit();

      const updatedProduct = await this.modelProduct.findByPk(id, {
        include: [
          {
            model: ProductToppingGroup,
            as: 'productToppingGroups',
            attributes: ['toppingGroupId'],
          },
        ],
      });

      return {
        success: true,
        message: 'Cập nhật sản phẩm thành công!',
        data: updatedProduct,
      };
    } catch (error) {
      await transaction.rollback();
      console.error('Lỗi cập nhật sản phẩm:', error);

      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(
        error.message || 'Cập nhật sản phẩm thất bại',
      );
    }
  }

  async findAllProducts(filter: filterProductDto) {
    const where: any = {};
    const { name, categoryId, isActive, minPrice, maxPrice, merchantId } =
      filter;

    if (name) where.name = { [Op.iLike]: `%${name}%` };
    if (categoryId) where.categoryId = categoryId;
    if (merchantId) where.merchantId = merchantId;
    if (typeof isActive === 'boolean') where.isActive = isActive;
    if (minPrice || maxPrice)
      where.basePrice = {
        ...(minPrice && { [Op.gte]: minPrice }),
        ...(maxPrice && { [Op.lte]: maxPrice }),
      };

    const page = filter.page ?? 1;
    const limit = filter.limit ?? 100;
    const offset = (page - 1) * limit;

    const result = await this.modelProduct.findAndCountAll({
      where,
      limit,
      offset,
      attributes: [
        'id',
        'name',
        'basePrice',
        'description',
        'image',
        'isActive',
      ],
      include: [
        {
          model: this.modelProductToppingGroup,
          include: [
            {
              model: this.modelToppingGroup,
              include: [
                {
                  model: this.modelTopping,
                  attributes: ['id', 'name', 'price'],
                  where: { is_active: true },
                  required: false,
                },
              ],
              attributes: [
                'id',
                'name',
                'is_required',
                'minSelection',
                'maxSelection',
              ],
            },
          ],
        },
        {
          model: this.modelCategory,
          attributes: ['id', 'name', 'merchantId'],
        },
      ],
    });

    return {
      totalRecords: result.count,
      page,
      numberData: result.rows.length,
      data: result.rows,
    };
  }

  async softDeteleProduct(id: number) {
    await this.modelProduct.update({ isActive: false }, { where: { id } });
    return {
      message: 'Xóa sản phẩm thành công',
    };
  }

  async hardDeleteProduct(id: number) {
    await this.modelProduct.destroy({ where: { id } });
    return {
      message: 'Xóa sản phẩm thành công',
    };
  }
}
