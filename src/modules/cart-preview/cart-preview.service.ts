import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import {
  Address,
  Cart,
  CartItem,
  CartItemTopping,
  Product,
  ProductVariant,
  Topping,
} from 'src/models';
import { AddressService } from '../address/address.service';
import { CheckoutCaculateDto } from './dto/checkout.dto';
import { CartCheckoutOutput, CartPreviewItem, CartPreviewOutput } from './types/cart-prev.type';
import { Helper } from 'src/common/helpers/helper';

@Injectable()
export class CartPreviewService {
  constructor(
    @InjectModel(CartItem) private cartItemModel: typeof CartItem,
    @InjectModel(Cart) private cartModel: typeof Cart,
    @InjectModel(CartItemTopping)
    private cartItemToppingModel: typeof CartItemTopping,
    @InjectModel(ProductVariant)
    private productVariantModel: typeof ProductVariant,
    @InjectModel(Topping) private toppingModel: typeof Topping,
    @InjectModel(Address) private addressModel: typeof Address,
    @InjectModel(Product) private productModel: typeof Product,
    private readonly addressService: AddressService,
    private readonly sequelize: Sequelize,
  ) {}

  async cartPreview(
    userId: number,
    merchantId: number,
    cartItemIds: number[],
    transaction: any,
  ): Promise<CartPreviewOutput> {
    // Tìm giỏ hàng của user cho merchant đó
    const cart = await this.cartModel.findOne({
      where: {
        userId,
        merchantId,
      },
      transaction,
    });

    if (!cart) {
      throw new BadRequestException(
        'Không tìm thấy giỏ hàng cho cửa hàng này.',
      );
    }

    // Lấy danh sách item trong cart (hoặc lọc theo cartItemIds nếu có)
    const whereClause: any = { cartId: cart.id };
    if (cartItemIds && cartItemIds.length > 0) {
      whereClause.id = { [Op.in]: cartItemIds };
    }

    const cartItems = await this.cartItemModel.findAll({
      where: whereClause,
      include: [
        {
          model: this.productModel,
          attributes: ['id', 'name', 'basePrice', 'image', 'merchantId'],
          where: { merchantId },
        },
        {
          model: this.productVariantModel,
          attributes: ['id', 'name', 'size', 'type', 'modifiedPrice'],
        },
        {
          model: this.cartItemToppingModel,
          attributes: ['id', 'toppingId', 'quantity'],
          include: [
            {
              model: this.toppingModel,
              attributes: ['id', 'name', 'price'],
            },
          ],
        },
      ],
      transaction,
    });

    if (!cartItems.length) {
      throw new BadRequestException(
        'Giỏ hàng trống hoặc không có sản phẩm hợp lệ.',
      );
    }

    // Xử lý từng item
    // const previewItems: CartPreviewItem[] = cartItems.map((item) => {
    //   const product = item.product;
    //   const variant = item.variant;
    //   const toppings = item.cartItemToppings || [];

    //   const toppingTotal = toppings.reduce(
    //     (sum, t) => sum + (t.topping?.price || 0) * (t.quantity || 1),
    //     0,
    //   );

    //   const basePrice = variant?.modifiedPrice ?? product?.basePrice ?? 0;

    //   const subtotal = (basePrice + toppingTotal) * item.quantity;

    //   return {
    //     cartItemId: item.id,
    //     productName: product.name,
    //     productVariantName: variant?.name ?? null,
    //     productVariantsize: variant?.size ?? null,
    //     productVarianttype: variant?.type ?? null,
    //     priceProduct: basePrice,
    //     quantity: item.quantity,
    //     toppings: toppings.map((t) => ({
    //       toppingId: t.topping.id,
    //       toppingName: t.topping.name,
    //       price: t.topping.price,
    //     })),
    //     subtotal,
    //   };
    // });

    // Xử lý từng item
    const previewItems: CartPreviewItem[] = cartItems.map((item) => {
      const product = item.product;
      const variant = item.variant;
      const toppings = item.cartItemToppings || [];

      // Tính tổng topping
      const toppingTotal = toppings.reduce(
        (sum, t) => sum + (t.topping?.price || 0) * (t.quantity || 1),
        0,
      );

      // modifiedPrice là giá cộng thêm → cộng với basePrice
      const basePrice =
        (product?.basePrice || 0) + (variant?.modifiedPrice || 0);

      // Tổng phụ cho 1 item (đã nhân theo quantity)
      const subtotal = (basePrice + toppingTotal) * item.quantity;

      return {
        cartItemId: item.id,
        productName: product.name,
        productVariantName: variant?.name ?? null,
        productVariantsize: variant?.size ?? null,
        productVarianttype: variant?.type ?? null,
        priceProduct: basePrice,
        quantity: item.quantity,
        toppings: toppings.map((t) => ({
          toppingId: t.topping.id,
          toppingName: t.topping.name,
          price: t.topping.price,
          quantity: t.quantity,
        })),
        subtotal,
      };
    });

    // Tổng tiền
    const totalAmount = previewItems.reduce((sum, i) => sum + i.subtotal, 0);

    // Trả kết quả
    return {
      message: 'Xem trước giỏ hàng thành công.',
      data: {
        items: previewItems,
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
