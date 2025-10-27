import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import {
  Category,
  Product,
  ProductTopping,
  ProductVariant,
  Topping,
} from 'src/models';
import { CategoryService } from '../category/category.service';
import { ProductToppingService } from '../product-topping/product-topping.service';
import { ProductVariantService } from '../product-variant/product-variant.service';
import { ToppingService } from '../topping/topping.service';
import { CreateProductDto } from './dto/create-product.dto';
import { filterProductDto } from './dto/filter-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product) private readonly modelProduct: typeof Product,
    @InjectModel(ProductVariant)
    private readonly modelProductVariant: typeof ProductVariant,
    @InjectModel(ProductTopping)
    private readonly modelProductTopping: typeof ProductTopping,
    @InjectModel(Topping) private readonly modelTopping: typeof Topping,
    @InjectModel(Category) private readonly modelCategory: typeof Category,
    private readonly configService: ConfigService,
    private readonly productVariantService: ProductVariantService,
    private readonly toppingService: ToppingService,
    private readonly productToppingService: ProductToppingService,
    private readonly categoryService: CategoryService,
    private readonly sequelize: Sequelize,
  ) {}

  async findOneProductById(id: number) {
    const result = await this.modelProduct.findByPk(id, {
      include: [
        {
          model: this.modelProductVariant,
          attributes: {
            include: [
              [
                Sequelize.literal(
                  '"Product"."basePrice" + "productVariants"."modifiedPrice"',
                ),
                'variantPrice',
              ],
            ],
          },
        },
        {
          model: this.modelProductTopping,
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'productId'],
          },
          include: [
            {
              model: this.modelTopping,
              attributes: ['name', 'description', 'image', 'price'],
            },
          ],
        },
        {
          model: this.modelCategory,
          attributes: ['name'],
        },
      ],
      attributes: ['name', 'description', 'basePrice', 'image'],
    });
    return result;
  }

  async createProduct(productDto: CreateProductDto) {
    const transaction = await this.sequelize.transaction();
    try {
      const alreadyExistedCategory = await this.categoryService.findOneCategory(
        productDto.categoryId,
      );
      if (!alreadyExistedCategory)
        throw new BadRequestException(
          'Category ứng với product chưa được tìm thấy!',
        );

      const payload: Record<string, any> = {
        name: productDto.name,
        basePrice: productDto.basePrice,
        image: productDto.image,
        categoryId: productDto.categoryId,
        merchantId: productDto.merchantId, // Added to match model
      };

      if (productDto.description) payload.description = productDto.description;

      const newProduct = await this.modelProduct.create(payload as any, {
        transaction,
      });

      if (newProduct && (newProduct.id || newProduct.dataValues.id)) {
        const productId = newProduct.id || newProduct.dataValues.id;

        const variantKeys = productDto.productVariants.map(
          (v) => `${v.size}-${v.type}`,
        );
        const existedKeysVariant = new Set(variantKeys);

        if (variantKeys.length !== existedKeysVariant.size) {
          throw new BadRequestException(
            'Có một vài biến thể bị trùng lặp size và type',
          );
        }

        for (const variant of productDto.productVariants) {
          const existedVariantDB =
            await this.productVariantService.existedProductVanriantDB(
              productId,
              variant.size,
              variant.type,
            );

          if (existedVariantDB) {
            throw new BadRequestException(
              `Variant với size "${variant.size}" và type "${variant.type}" đã tồn tại cho sản phẩm này!`,
            );
          }
        }

        const productVariants = productDto.productVariants.map((item) => ({
          ...item,
          productId,
        }));
        await this.modelProductVariant.bulkCreate(productVariants as any, {
          transaction,
        });
      }

      if (newProduct && (newProduct.id || newProduct.dataValues.id)) {
        const productId = newProduct.id || newProduct.dataValues.id;

        const toppingIds = productDto.productToppings.map(
          (topping) => topping.toppingId,
        );
        const existedIdToppings = new Set(toppingIds);

        const alreadyExisted = await this.modelTopping.findAll({
          where: {
            id: {
              [Op.in]: toppingIds,
            },
          },
        });
        if (alreadyExisted.length <= 0) {
          throw new BadRequestException(
            'Có một vài món topping chưa được tìm thấy',
          );
        }

        const finalProductTopping = new Map();
        productDto.productToppings.forEach((topping) => {
          const key = topping.toppingId;

          if (finalProductTopping.has(key)) {
            const foundKey = finalProductTopping.get(key);
            foundKey.quantity += topping.quantity;
          } else {
            finalProductTopping.set(key, {
              ...topping,
              productId,
            });
          }
        });
        const productTopping = Array.from(finalProductTopping.values());
        await this.modelProductTopping.bulkCreate(productTopping as any, {
          transaction,
        });
      }

      await transaction.commit();
      return {
        message: 'Tạo sản phẩm thành công',
      };
    } catch (error) {
      console.log(error);
      await transaction.rollback();
      throw error;
    }
  }

  async updateProduct(id: number, productDto: UpdateProductDto) {
    const transaction = await this.sequelize.transaction();
    try {
      const alreadyExistedProduct = await this.findOneProductById(id);
      if (!alreadyExistedProduct)
        throw new BadRequestException('Sản phẩm chưa được tìm thấy!');

      const whereClause: Record<string, any> = {};
      if (productDto.name) whereClause.name = productDto.name;
      if (productDto.description)
        whereClause.description = productDto.description;
      if (productDto.image) whereClause.image = productDto.image;
      if (productDto.categoryId) {
        const alreadyExistedCategory =
          await this.categoryService.findOneCategory(
            productDto.categoryId as any,
          );
        if (!alreadyExistedCategory)
          throw new BadRequestException(
            'Category ứng với product chưa được tìm thấy!',
          );
        whereClause.categoryId = productDto.categoryId;
      }
      if (productDto.basePrice) whereClause.basePrice = productDto.basePrice;
      if (productDto.merchantId) whereClause.merchantId = productDto.merchantId; // Added to match model
      await this.modelProduct.update(whereClause, {
        where: { id },
        transaction,
        individualHooks: true,
      });

      if (productDto.productVariants && productDto.productVariants.length > 0) {
        for (const variantDto of productDto.productVariants) {
          if (variantDto.id) {
            if (variantDto.id <= 0) {
              throw new BadRequestException('Id của biến thể phải lớn hơn 0');
            }
            await this.productVariantService.findOneProductVariant(
              variantDto.id,
              id,
            );
            await this.modelProductVariant.update(
              {
                name: variantDto.name,
                type: variantDto.type,
                size: variantDto.size,
                modifiedPrice: variantDto.modifiedPrice,
              },
              { where: { id: variantDto.id }, transaction },
            );
          }
        }
      }

      if (productDto.productToppings && productDto.productToppings.length > 0) {
        const productToppingIds = productDto.productToppings.map(
          (topping) => topping.id,
        );
        await this.productToppingService.existedProductTopping(
          productToppingIds as number[],
        );

        const toppingIds = productDto.productToppings.map(
          (topping) => topping.toppingId,
        );
        await this.toppingService.existedTopping(toppingIds as number[]);
        for (const productToppingDto of productDto.productToppings) {
          if (productToppingDto.id) {
            await this.modelProductTopping.update(
              {
                quantity: productToppingDto.quantity,
                isDefault: productToppingDto.isDefault,
                toppingId: productToppingDto.toppingId,
              },
              {
                where: {
                  id: productToppingDto.id,
                },
                transaction,
              },
            );
          }
        }
      }

      await transaction.commit();
      return {
        message: 'Chỉnh sửa sản phẩm thành công',
      };
    } catch (error) {
      console.log(error);
      await transaction.rollback();
      throw error;
    }
  }

  async findAllProducts(filterSearch: filterProductDto) {
    const {
      name,
      categoryId,
      isActive,
      page,
      limit,
      sortBy,
      sortOrder,
      minPrice,
      maxPrice,
    } = filterSearch;
    const whereClause: Record<string, any> = {};

    if (name !== undefined) {
      whereClause.name = {
        [Op.iLike]: `%${name}%`,
      };
    }
    if (categoryId !== undefined) whereClause.categoryId = categoryId;
    whereClause.isActive = true;

    const currentPage = Number(page || 1);
    const limitPage = Number(
      limit || this.configService.get('LIMIT_PAGE') || 10,
    );
    const offsetPage = Number(currentPage - 1) * limitPage;

    if (minPrice !== undefined || maxPrice !== undefined) {
      whereClause.basePrice = {};
      if (minPrice !== undefined) whereClause.basePrice[Op.gte] = minPrice;
      if (maxPrice !== undefined) whereClause.basePrice[Op.lte] = maxPrice;
    }

    let orderClause: any[];
    if (sortBy !== undefined) {
      orderClause = [[sortBy, sortOrder || 'DESC']];
    } else {
      orderClause = [['createdAt', 'DESC']];
    }

    const result = await this.modelProduct.findAndCountAll({
      where: whereClause,
      limit: limitPage,
      offset: offsetPage,
      order: orderClause,
      raw: true,
    });

    return {
      totalRecords: result.count,
      page: currentPage,
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
