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

  async addToCart(
    dataAdd: CreateCartItemDto,
    userId: number,
    merchantId: number,
  ) {
    const { productId, variantId, quantity, toppingId } = dataAdd;
    const transaction = await this.sequelize.transaction();

    try {
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

      // Kiểm tra variant
      const existedProductVariant =
        await this.productVariantService.findById(variantId);
      if (!existedProductVariant)
        throw new BadGatewayException('Biến thể chưa được tìm thấy!');

      // Lấy hoặc tạo cart cho user + merchant
      const cart = await this.cartService.getOrCreateUserCart(
        userId,
        merchantId,
        transaction,
      );

      const toppingIds = toppingId ?? [];

      // Kiểm tra xem cartItem trùng chưa (cùng product + variant + topping)
      const matchingCartItem = await this.matchingCartItem(
        cart.id,
        productId,
        variantId,
        toppingIds,
      );

      // Nếu đã tồn tại thì tăng số lượng
      if (matchingCartItem) {
        await matchingCartItem.increment('quantity', {
          by: quantity,
          transaction,
        });

        await matchingCartItem.reload({ transaction });

        if (toppingIds.length > 0) {
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
          variantId,
          quantity,
        } as CartItem,
        { transaction },
      );

      if (toppingIds.length > 0) {
        const toppingRecords = toppingIds.map((id) => ({
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
      if (error instanceof Error) {
        throw new BadGatewayException(error.message);
      }
      throw new BadGatewayException('Unknown error');
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

      console.log(
        cartItem.cart.userId,
        userId,
        cartItem.cart.merchantId,
        merchantId,
      );

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
    variantId: number,
    toppingIds: number[],
  ): Promise<CartItem | null> {
    const matchesCartItem = await this.modelCartItem.findAll({
      where: {
        cartId: cartId,
        productId: productId,
        variantId: variantId,
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

  async getCartItemsById(idCart: number) {
    return await this.modelCartItem.findByPk(idCart);
  }

  async getCartItemByCartId(
    cartId: number,
    userId: number,
    merchantId: number,
    transaction: any,
  ): Promise<any> {
    const cart = await this.modelCart.findByPk(cartId);
    if (!cart || cart.userId !== userId || cart.merchantId !== merchantId) {
      throw new BadRequestException('Không có quyền truy cập giỏ hàng này');
    }

    const cartItems = await this.modelCartItem.findAll({
      where: { cartId },
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
      const toppingTotal = cartItem.cartItemToppings.reduce(
        (sum, t) => sum + t.topping.price * t.quantity,
        0,
      );
      return {
        ...cartItem,
        subTotal: (priceProduct + toppingTotal) * cartItem.quantity,
      };
    });

    return { message: 'Lấy giỏ hàng thành công', data: summary };
  }
}
