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
  Merchant,
  Product,
  Topping,
} from 'src/models';
import { CartService } from '../cart/cart.service';
import { ProductService } from '../product/product.service';
import { CreateCartItemDto } from './dto/cart-item.dto';
import { actionUpdateCartItem } from './types/cartItem.type';

@Injectable()
export class CartItemService {
  constructor(
    @InjectModel(Cart) private readonly modelCart: typeof Cart,
    @InjectModel(CartItem) private readonly modelCartItem: typeof CartItem,
    @InjectModel(CartItemTopping)
    private readonly modelCartItemTopping: typeof CartItemTopping,
    @InjectModel(Product) private readonly modelProduct: typeof Product,
    @InjectModel(Topping)
    private readonly modelTopping: typeof Topping,
    @InjectModel(Merchant) private readonly modelMerchant: typeof Merchant,
    private readonly productService: ProductService,
    private readonly cartService: CartService,
    private readonly sequelize: Sequelize,
  ) {}

  async addToCart(
    dataAdd: CreateCartItemDto,
    userId: number,
    merchantId: number,
  ) {
    const transaction = await this.sequelize.transaction();

    try {
      const { productId, quantity, selectedToppingIds = [] } = dataAdd;
      console.log(selectedToppingIds);
      if (quantity <= 0) {
        throw new BadGatewayException('Số lượng biến thể phải lớn hơn 0 !!!');
      }

      // Kiểm tra sản phẩm
      const existedProduct =
        await this.productService.findOneProductById(productId);
      if (!existedProduct)
        throw new BadGatewayException('Sản phẩm chưa được tìm thấy!');

      // Kiểm tra merchant có đúng không
      if (existedProduct.category.merchantId !== merchantId) {
        throw new BadGatewayException('Sản phẩm không thuộc merchant này!');
      }

      // Lấy hoặc tạo cart cho user + merchant
      const cart = await this.cartService.getOrCreateUserCart(
        userId,
        merchantId,
        transaction,
      );

      // Kiểm tra xem cartItem trùng chưa (cùng product + topping)
      const matchingCartItem = await this.matchingCartItem(
        cart.id,
        productId,
        selectedToppingIds,
      );

      // Nếu đã tồn tại thì tăng số lượng
      if (matchingCartItem) {
        await matchingCartItem.increment('quantity', {
          by: quantity,
          transaction,
        });

        await matchingCartItem.reload({ transaction });

        if (selectedToppingIds.length > 0) {
          const upQuantityCartItemTopping =
            await this.modelCartItemTopping.findAll({
              where: { cartItemId: matchingCartItem.id },
            });

          await Promise.all(
            upQuantityCartItemTopping.map(async (item) => {
              await item.increment('quantity', { by: quantity, transaction });
            }),
          );
        }

        await transaction.commit();
        return {
          message: 'Đã tăng số lượng sản phẩm thành công!',
          data: matchingCartItem,
        };
      }

      // Nếu chưa có thì tạo mới
      const newCartItem = await this.modelCartItem.create(
        {
          cartId: cart.id,
          productId,
          quantity,
        } as CartItem,
        { transaction },
      );

      if (selectedToppingIds.length > 0) {
        const toppingRecords = selectedToppingIds.map((id) => ({
          cartItemId: newCartItem.id,
          toppingId: id,
          quantity,
        }));

        await this.modelCartItemTopping.bulkCreate(toppingRecords as any, {
          transaction,
        });
      }

      await transaction.commit();
      return { message: 'Thêm vào giỏ hàng thành công!' };
    } catch (error) {
      await transaction.rollback();
      throw new BadGatewayException(error.message);
    }
  }

  async increOrDecreQuantity(
    cartItemId: number,
    action: actionUpdateCartItem,
    userId: number,
    merchantId: number,
  ) {
    const transaction = await this.sequelize.transaction();
    try {
      const cartItem = await this.modelCartItem.findByPk(cartItemId, {
        include: [
          { model: this.modelCart, attributes: ['userId', 'merchantId'] },
        ],
        transaction,
      });

      if (!cartItem) {
        throw new BadGatewayException('Không tìm thấy sản phẩm trong giỏ hàng');
      }

      if (
        cartItem.cart.userId !== userId ||
        cartItem.cart.merchantId !== merchantId
      ) {
        throw new BadRequestException('Không có quyền thao tác giỏ hàng này');
      }

      if (action === 'increment') {
        await cartItem.increment('quantity', { by: 1, transaction });

        const toppings = await this.modelCartItemTopping.findAll({
          where: { cartItemId: cartItem.id },
          transaction,
        });

        for (const item of toppings) {
          await item.increment('quantity', { by: 1, transaction });
        }

        await transaction.commit();
        return { message: 'Tăng số lượng thành công', data: cartItem };
      }

      if (action === 'decrement') {
        if (cartItem.quantity <= 1) {
          await this.modelCartItemTopping.destroy({
            where: { cartItemId: cartItem.id },
            transaction,
          });
          await cartItem.destroy({ transaction });
          await transaction.commit();
          return { message: 'Đã xóa sản phẩm khỏi giỏ hàng' };
        }

        await cartItem.decrement('quantity', { by: 1, transaction });

        const toppings = await this.modelCartItemTopping.findAll({
          where: { cartItemId: cartItem.id },
          transaction,
        });

        for (const item of toppings) {
          await item.decrement('quantity', { by: 1, transaction });
        }

        await transaction.commit();
        return { message: 'Giảm số lượng thành công', data: cartItem };
      }

      throw new BadRequestException('Hành động không hợp lệ');
    } catch (error) {
      await transaction.rollback();
      throw new BadGatewayException(error.message || 'Lỗi không xác định');
    }
  }

  async deleteCartItem(cartItemId: number, userId: number, merchantId: number) {
    const transaction = await this.sequelize.transaction();
    try {
      const cartItem = await this.modelCartItem.findByPk(cartItemId, {
        include: [
          { model: this.modelCart, attributes: ['userId', 'merchantId'] },
        ],
        transaction,
      });

      if (!cartItem) {
        throw new BadGatewayException('Không tìm thấy sản phẩm trong giỏ hàng');
      }

      if (
        cartItem.cart.userId !== userId ||
        cartItem.cart.merchantId !== merchantId
      ) {
        throw new BadRequestException('Không có quyền xóa giỏ hàng này');
      }

      await this.modelCartItemTopping.destroy({
        where: { cartItemId },
        transaction,
      });

      await cartItem.destroy({ transaction });

      await transaction.commit();
      return { message: 'Đã xóa sản phẩm trong giỏ hàng' };
    } catch (error) {
      await transaction.rollback();
      throw new BadGatewayException(error.message || 'Lỗi không xác định');
    }
  }

  async matchingCartItem(
    cartId: number,
    productId: number,
    toppingIds: number[],
  ): Promise<CartItem | null> {
    const matchesCartItem = await this.modelCartItem.findAll({
      where: {
        cartId: cartId,
        productId: productId,
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

  // async findCartItemWithoutToppings(
  //   cartId: number,
  //   productId: number,
  // ): Promise<CartItem | null> {
  //   return await this.modelCartItem.findOne({
  //     where: {
  //       cartId: cartId,
  //       productId: productId,
  //     },
  //     include: [
  //       {
  //         model: this.modelCartItemTopping,
  //         required: false, // LEFT JOIN
  //         attributes: [],
  //       },
  //     ],
  //     having: this.sequelize.where(
  //       this.sequelize.fn('COUNT', this.sequelize.col('cartItemToppings.id')),
  //       0,
  //     ),
  //     group: ['CartItems.id'],
  //   });
  // }

  async getCartItemsById(idCart: number) {
    return await this.modelCartItem.findByPk(idCart);
  }

  async getCartItemByCartId(
    cartId: number,
    userId: number,
    merchantId: number,
    transaction?: any,
  ): Promise<any> {
    // Kiểm tra quyền sở hữu giỏ hàng
    const cart = await this.modelCart.findByPk(cartId);
    if (!cart || cart.userId !== userId || cart.merchantId !== merchantId) {
      throw new BadRequestException('Không có quyền truy cập giỏ hàng này');
    }

    const merchant = await this.modelMerchant.findByPk(cart.merchantId);

    // Lấy tất cả cart item + product + topping
    const cartItems = await this.modelCartItem.findAll({
      where: { cartId: cartId },
      include: [
        {
          model: this.modelProduct,
          attributes: ['id', 'name', 'basePrice', 'image'],
        },
        {
          model: this.modelCartItemTopping,
          attributes: ['id', 'toppingId', 'quantity'],
          include: [
            {
              model: this.modelTopping,
              attributes: ['id', 'name', 'price'],
            },
          ],
        },
      ],
      order: [['createdAt', 'ASC']],
      transaction,
    });

    // Map dữ liệu và tính toán subtotal từng item
    const items = cartItems.map((item) => {
      const data = item.toJSON();

      const productPrice = data.product?.basePrice ?? 0;

      const toppingTotal = data.cartItemToppings?.reduce(
        (sum, t) => sum + (t.topping?.price ?? 0) * t.quantity,
        0,
      );

      const subTotal = (productPrice + toppingTotal) * data.quantity;

      return {
        id: data.id,
        quantity: data.quantity,
        product: {
          id: data.product?.id,
          name: data.product?.name,
          image: data.product?.image,
          base_price: data.product?.basePrice,
        },
        toppings: data.cartItemToppings?.map((t) => ({
          id: t.topping?.id,
          name: t.topping?.name,
          price: t.topping?.price,
          quantity: t.quantity,
        })),
        subTotal,
      };
    });

    // Tổng cộng toàn giỏ
    const total = items.reduce((sum, item) => sum + item.subTotal, 0);

    return {
      message: 'Lấy giỏ hàng thành công',
      data: {
        cartId,
        merchantId,
        merchantName: merchant?.name,
        items,
        total,
      },
    };
  }
}
