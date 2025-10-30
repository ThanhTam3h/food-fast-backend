import {
  BadGatewayException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Helper } from 'src/common/helpers/helper';
import {
  Cart,
  CartItem,
  CartItemTopping,
  Product,
  ProductTopping,
  ProductVariant,
  Topping,
} from 'src/models';
import { CartService } from '../cart/cart.service';
import { ProductVariantService } from '../product-variant/product-variant.service';
import { ProductService } from '../product/product.service';
import { CreateCartItemDto } from './dto/cart-item.dto';
import { actionUpdateCartItem } from './types/cartItem.type';

@Injectable()
export class CartItemService {
  // sequelize: any;
  constructor(
    @InjectModel(Cart) private readonly modelCart: typeof Cart,
    @InjectModel(CartItem) private readonly modelCartItem: typeof CartItem,
    @InjectModel(CartItemTopping)
    private readonly modelCartItemTopping: typeof CartItemTopping,
    @InjectModel(Product) private readonly modelProduct: typeof Product,
    @InjectModel(Topping)
    private readonly modelTopping: typeof Topping,
    @InjectModel(ProductVariant)
    private readonly modelProductVariant: typeof ProductVariant,
    @InjectModel(ProductTopping)
    private readonly modelProductTopping: typeof ProductTopping,

    private readonly productService: ProductService,
    private readonly productVariantService: ProductVariantService,
    private readonly cartService: CartService,
    private readonly sequelize: Sequelize,
  ) {}

  async findById(id: number) {
    return await this.modelProductVariant.findByPk(id);
  }

  async addToCart(dataAdd: CreateCartItemDto) {
    const { productId, variantId, quantity, userId, toppingId } = dataAdd;
    console.log(dataAdd);

    const transaction = await this.sequelize.transaction();

    try {
      if (quantity <= 0) {
        throw new BadGatewayException('Số lượng biến thể phải lớn hơn 0 !!!');
      }

      // ✅ Kiểm tra sản phẩm
      const existedProduct =
        await this.productService.findOneProductById(productId);
      if (!existedProduct)
        throw new BadGatewayException('Sản phẩm chưa được tìm thấy!');

      console.log(existedProduct.category.merchantId);

      // ✅ Lấy merchantId từ product
      const merchantId = existedProduct.category.merchantId;
      if (!merchantId)
        throw new BadGatewayException('Sản phẩm không thuộc merchant hợp lệ!');

      // ✅ Kiểm tra variant
      const existedProductVariant =
        await this.productVariantService.findById(variantId);
      if (!existedProductVariant)
        throw new BadGatewayException('Biến thể chưa được tìm thấy!');

      // ✅ Lấy hoặc tạo cart cho user + merchant
      const cart = await this.cartService.getOrCreateUserCart(
        userId,
        merchantId,
        transaction,
      );

      const toppingIds = toppingId ?? [];
      const matchingCartItem = await this.matchingCartItem(
        cart.id,
        productId,
        variantId,
        toppingIds,
      );

      if (matchingCartItem) {
        await matchingCartItem.increment('quantity', {
          by: quantity,
          transaction,
        });

        await matchingCartItem.reload({ transaction });

        if (toppingIds.length > 0) {
          const upQuantityCartItemTopping =
            await this.modelCartItemTopping.findAll({
              where: {
                cartItemId: matchingCartItem.id,
              },
            });

          await Promise.all(
            upQuantityCartItemTopping.map(async (item) => {
              await item.increment('quantity', { by: quantity, transaction });
            }),
          );
        }

        await transaction.commit();
        return {
          message: 'Đã tăng số lượng thành công!',
          data: matchingCartItem,
        };
      } else {
        // ✅ Nếu chưa có thì tạo mới cartItem
        const newCartItem = await this.modelCartItem.create(
          {
            cartId: cart.id,
            productId,
            variantId,
            quantity,
          } as CartItem,
          { transaction },
        );

        if (toppingIds.length > 0) {
          for (const id of toppingIds) {
            await this.modelCartItemTopping.create(
              {
                cartItemId: newCartItem.id,
                toppingId: id,
                quantity,
              } as CartItemTopping,
              { transaction },
            );
          }
        }

        await transaction.commit();
        return { message: 'Thêm vào giỏ hàng thành công!' };
      }
    } catch (error) {
      // console.log(error);
      await transaction.rollback();
      if (error instanceof Error) {
        throw new BadGatewayException(error.message);
      }
      throw new BadGatewayException('Unknown error');
    }
  }

  async increOrDecreQuantity(cartItemId: number, action: actionUpdateCartItem) {
    const transaction = await this.sequelize.transaction();
    try {
      const cartItem = await this.modelCartItem.findByPk(cartItemId, {
        transaction,
      });

      if (!cartItem) {
        throw new BadGatewayException('Giỏ hàng khóa chưa được tìm thấy!');
      }

      if (action === 'increment') {
        await cartItem.increment('quantity', {
          by: 1,
          transaction,
        });

        const cartItemTopping = await this.modelCartItemTopping.findAll({
          where: {
            cartItemId: cartItem.dataValues.id,
          },
          transaction,
        });
        if (cartItemTopping.length > 0) {
          await Promise.all(
            cartItemTopping.map(async (item) => {
              await item.increment('quantity', {
                by: 1,
                transaction,
              });
            }),
          );
        }
        await cartItem.reload({ transaction });

        await transaction.commit();

        return {
          message: 'Đã tăng số lượng thành công',
          data: cartItem,
        };
      } else if (action === 'decrement') {
        if (cartItem.dataValues.quantity <= 1) {
          await this.modelCartItemTopping.destroy({
            where: { cartItemId: cartItem.dataValues.id },
            transaction,
          });

          await cartItem.destroy({
            transaction,
          });

          await transaction.commit();

          return {
            message: 'Đã xóa sản phẩm thành công',
          };
        }
        await cartItem.decrement('quantity', {
          by: 1,
          transaction,
        });

        const cartItemTopping = await this.modelCartItemTopping.findAll({
          where: {
            cartItemId: cartItem.dataValues.id,
          },
          transaction,
        });
        if (cartItemTopping.length > 0) {
          await Promise.all(
            cartItemTopping.map(async (item) => {
              await item.decrement('quantity', {
                by: 1,
                transaction,
              });
            }),
          );
        }
        await cartItem.reload({ transaction });

        await transaction.commit();

        return {
          message: 'Đã giảm số lượng thành công',
          data: cartItem,
        };
      }
    } catch (error) {
      // console.log(error);
      await transaction.rollback();
      if (error instanceof Error) {
        throw new BadGatewayException(error.message);
      }
      throw new BadGatewayException('Unknown error');
    }
  }

  async deleteCartItem(cartItemId: number) {
    const transaction = await this.sequelize.transaction();
    try {
      await this.modelCartItem.destroy({
        where: {
          id: cartItemId,
        },
        transaction,
      });

      await transaction.commit();

      return {
        message: 'Đã xóa sản phẩm trong giỏ hàng',
      };
    } catch (error) {
      // console.log(error);
      await transaction.rollback();
      if (error instanceof Error) {
        throw new BadGatewayException(error.message);
      }
      throw new BadGatewayException('Unknown error');
    }
  }

  async matchingCartItem(
    cartId: number,
    productId: number,
    productVariantId: number,
    toppingIds: number[],
  ): Promise<CartItem | null> {
    const matchesCartItem = await this.modelCartItem.findAll({
      where: {
        cartId: cartId,
        productId: productId,
        variantId: productVariantId,
      },
    });

    if (matchesCartItem.length === 0 || !matchesCartItem) return null;

    const sortToppingIds = [...toppingIds].sort((a, b) => a - b);

    for (const item of matchesCartItem) {
      const matchesCartItemTopping = await this.modelCartItemTopping.findAll({
        where: {
          cartItemId: item.id,
        },
        attributes: ['toppingId'],
      });
      const sortmatchesCartItemTopping = [...matchesCartItemTopping]
        .map((topping) => topping.get('toppingId'))
        .sort((a, b) => a - b);

      if (Helper.isEqualArray(sortToppingIds, sortmatchesCartItemTopping)) {
        return item;
      }
    }

    return null;
  }

  async findCartItemWithoutToppings(
    cartId: number,
    productId: number,
    variantId: number,
  ): Promise<CartItem | null> {
    return await this.modelCartItem.findOne({
      where: {
        cartId: cartId,
        productId: productId,
        variantId: variantId,
      },
      include: [
        {
          model: this.modelCartItemTopping,
          required: false, // LEFT JOIN
          attributes: [],
        },
      ],
      having: this.sequelize.where(
        this.sequelize.fn('COUNT', this.sequelize.col('cartItemToppings.id')),
        0,
      ),
      group: ['CartItems.id'],
    });
  }

  async mergeCart(userId: number) {
    if (!userId) {
      throw new BadRequestException('userId không hợp lệ hoặc chưa đăng nhập');
    }

    const transaction = await this.sequelize.transaction();

    try {
      //  Tìm giỏ hàng của user (nếu có)
      const userCart = await this.modelCart.findOne({
        where: { userId },
        include: [
          {
            model: this.modelCartItem,
            as: 'cartItems',
            include: [
              {
                model: this.modelProduct,
                attributes: ['id', 'name', 'basePrice', 'image'],
              },
              {
                model: this.modelProductVariant,
                attributes: ['id', 'name', 'size', 'type', 'modifiedPrice'],
              },
            ],
          },
        ],
        transaction,
      });

      if (!userCart) {
        throw new BadRequestException('Không tìm thấy giỏ hàng của người dùng');
      }

      //  Logic merge nội bộ nếu cần (VD: gộp trùng sản phẩm / biến thể)
      const groupedItems = new Map<string, any>();

      // for (const item of userCart.cartItems) {
      //   const key = `${item.productId}-${item.variantId}`;
      //   if (!groupedItems.has(key)) {
      //     groupedItems.set(key, { ...item, totalQuantity: item.quantity });
      //   } else {
      //     groupedItems.get(key).totalQuantity += item.quantity;
      //   }
      // }

      for (const item of userCart.cartItems) {
        const plainItem = item.get({ plain: true }); // 👈 Lấy data thực
        const key = `${plainItem.productId}-${plainItem.variantId}`;

        if (!groupedItems.has(key)) {
          groupedItems.set(key, {
            ...plainItem,
            totalQuantity: plainItem.quantity,
          });
        } else {
          groupedItems.get(key).totalQuantity += plainItem.quantity;
        }
      }

      // Cập nhật lại số lượng sau khi gộp
      for (const [_, grouped] of groupedItems.entries()) {
        await this.modelCartItem.update(
          { quantity: grouped.totalQuantity },
          {
            where: {
              cartId: userCart.id,
              productId: grouped.productId,
              variantId: grouped.variantId,
            },
            transaction,
          },
        );
      }

      //  Sau khi cập nhật xong, xóa các dòng trùng lặp thừa
      // const seenKeys = new Set<string>();
      // const duplicateIds: number[] = [];

      // for (const item of userCart.cartItems) {
      //   const key = `${item.productId}-${item.variantId}`;
      //   if (seenKeys.has(key)) {
      //     duplicateIds.push(item.id); // id của dòng trùng
      //   } else {
      //     seenKeys.add(key);
      //   }
      // }

      // if (duplicateIds.length > 0) {
      //   await this.modelCartItem.destroy({
      //     where: { id: duplicateIds },
      //     transaction,
      //   });
      // }

      await transaction.commit();

      return {
        message: 'Đã đồng bộ giỏ hàng thành công',
        data: userCart,
      };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof Error) {
        throw new BadGatewayException(error.message);
      }
      throw new BadGatewayException('Unknown error');
    }
  }

  async getCartItemsById(idCart: number) {
    return await this.modelCartItem.findByPk(idCart);
  }

  async getCartItemByCartId(cartId: number, transaction: any): Promise<any> {
    const cartItems = await this.modelCartItem.findAll({
      where: {
        cartId: cartId,
      },
      include: [
        {
          model: this.modelProduct,
          attributes: ['name', 'basePrice', 'image'],
        },
        {
          model: this.modelProductVariant,
          attributes: ['id', 'name', 'size', 'type', 'modifiedPrice'],
        },
        {
          model: this.modelCartItemTopping,
          attributes: ['id', 'toppingId', 'quantity'],
          include: [
            {
              model: this.modelTopping,
              attributes: ['name', 'description', 'image', 'price'],
            },
          ],
        },
      ],
      transaction,
    });
    const summary = cartItems.map((item) => {
      const cartItem = item.toJSON();

      const priceProduct =
        cartItem.variant?.modifiedPrice ?? cartItem.product?.basePrice;

      const cartTopping = cartItem.cartItemToppings;
      let priceTopping: number = 0;
      for (let Topping of cartTopping) {
        priceTopping += Topping.topping.price * Topping.quantity;
      }

      return {
        ...cartItem,
        subTotal: (priceProduct + priceTopping) * cartItem.quantity,
      };
    });
    return {
      message: 'Lấy cartItem thanh cong',
      data: summary,
    };
  }
}
