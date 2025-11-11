import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Helper } from 'src/common/helpers/helper';
import {
  Address,
  Cart,
  CartItem,
  CartItemTopping,
  Product,
  Topping,
} from 'src/models';
import { CheckoutCaculateDto } from './dto/checkout.dto';
import { CartCheckoutOutput, CartPreviewOutput } from './types/cart-prev.type';

@Injectable()
export class CartPreviewService {
  constructor(
    @InjectModel(CartItem) private cartItemModel: typeof CartItem,
    @InjectModel(Cart) private cartModel: typeof Cart,
    @InjectModel(CartItemTopping)
    private cartItemToppingModel: typeof CartItemTopping,
    @InjectModel(Topping) private toppingModel: typeof Topping,
    @InjectModel(Address) private addressModel: typeof Address,
    @InjectModel(Product) private productModel: typeof Product,
  ) {}

  async cartPreview(
    userId: number,
    merchantId: number,
    cartItemIds: number[],
    transaction: any,
  ): Promise<CartPreviewOutput> {
    const cart = await this.cartModel.findOne({
      where: { userId, merchantId },
      transaction,
    });
    if (!cart) {
      throw new BadRequestException(
        'Không tìm thấy giỏ hàng của merchant này.',
      );
    }

    const where: any = { cartId: cart.id };
    if (cartItemIds?.length) where.id = { [Op.in]: cartItemIds };

    const cartItems = await this.cartItemModel.findAll({
      where,
      include: [
        {
          model: this.productModel,
          attributes: ['id', 'name', 'basePrice', 'image'],
        },
        {
          model: this.cartItemToppingModel,
          attributes: ['id', 'toppingId', 'quantity'],
          include: [
            {
              model: this.toppingModel,
              attributes: ['id', 'name', 'price', 'topping_group_id'],
            },
          ],
        },
      ],
      transaction,
    });

    if (!cartItems.length)
      throw new BadRequestException('Giỏ hàng trống hoặc không hợp lệ.');

    const items = cartItems.map((item) => {
      const product = item.product;
      const toppings = item.cartItemToppings ?? [];

      const toppingTotal = toppings.reduce(
        (sum, t) => sum + (t.topping?.price || 0) * (t.quantity || 1),
        0,
      );
      const subtotal = (product.basePrice + toppingTotal) * item.quantity;

      return {
        cartItemId: item.id,
        productId: product.id,
        productName: product.name,
        image: product.image,
        quantity: item.quantity,
        priceProduct: product.basePrice,
        toppings: toppings.map((t) => ({
          toppingId: t.topping.id,
          toppingName: t.topping.name,
          groupId: t.topping.topping_group_id,
          price: t.topping.price,
          quantity: t.quantity,
        })),
        subtotal,
      };
    });

    const totalAmount = items.reduce((sum, i) => sum + i.subtotal, 0);

    return {
      message: 'Xem trước giỏ hàng thành công.',
      data: {
        items,
        totalAmount,
      },
    };
  }

  async checkoutCaculate(
    userId: number,
    merchantId: number,
    dto: CheckoutCaculateDto,
    transaction?: any,
  ): Promise<CartCheckoutOutput> {
    //  Lấy giỏ hàng xem trước
    const cartPrev = await this.cartPreview(
      userId,
      merchantId,
      dto.cartItemId,
      transaction,
    );

    if (!cartPrev || !cartPrev.data.items.length) {
      throw new BadRequestException('Không có sản phẩm hợp lệ trong giỏ hàng.');
    }

    // Tính phí giao hàng
    let deliveryFee = 0;
    if (dto.temporaryAddress) {
      // frontend gửi khoảng cách, hoặc bạn có thể tính từ tọa độ nhà hàng - khách hàng
      const distance = dto.distance || 0; // nếu chưa có, mặc định 0
      deliveryFee = Helper.caculateDeliveryFee(distance);
    } else if (dto.addressId) {
      const address = await this.addressModel.findByPk(dto.addressId);
      if (!address) {
        throw new BadRequestException('Không tìm thấy địa chỉ.');
      }
      const distance = address.dataValues['distance'] || 0;
      deliveryFee = Helper.caculateDeliveryFee(distance);
    }

    // Tổng tiền
    const subTotal = cartPrev.data.totalAmount;
    const finalTotal = subTotal + deliveryFee;

    // Trả kết quả
    return {
      message: 'Checkout tính toán thành công.',
      data: {
        items: cartPrev.data.items,
        subtotal: subTotal,
        deliveryFee,
        finalTotal,
      },
    };
  }
}
