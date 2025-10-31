import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import {
  Address,
  Order,
  OrderItem,
  OrderItemTopping,
  Product,
  ProductVariant,
  Topping,
  User,
} from 'src/models';
import { AddressService } from '../address/address.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Helper } from 'src/common/helpers/helper';
import { OrderStatus, PaymentStatus } from 'src/models/order.model';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order) private readonly orderModel: typeof Order,
    @InjectModel(OrderItem) private readonly orderItemModel: typeof OrderItem,
    @InjectModel(OrderItemTopping)
    private readonly orderItemToppingModel: typeof OrderItemTopping,
    @InjectModel(Address) private readonly addressModel: typeof Address,
    @InjectModel(ProductVariant)
    private readonly productVariantModel: typeof ProductVariant,
    @InjectModel(Product) private readonly productModel: typeof Product,
    @InjectModel(Topping) private readonly toppingModel: typeof Topping,
    private readonly addressService: AddressService,
    private readonly sequelize: Sequelize,
  ) {}

  async createOrder(orderData: CreateOrderDto): Promise<Order> {
    const transaction = await this.sequelize.transaction();

    try {
      const address = await this.addressModel.findByPk(orderData.addressId, {
        transaction,
      });
      if (!address) {
        throw new BadRequestException('Address not found');
      }
      if (address.userId !== orderData.userId) {
        throw new BadRequestException(
          'This address does not belong to this user',
        );
      }

      const distanceResult = orderData.distance;

      if (!Helper.validateDeliveryDistance(distanceResult)) {
        throw new BadRequestException('This address is out of delivery range');
      }

      const deliveryFee = Helper.caculateDeliveryFee(distanceResult);

      const subTotal = await this.caculateSubtotal(
        orderData.orderItems,
        transaction,
      );

      const total = subTotal + deliveryFee;

      const orderNumber = await Helper.generateOrderNumber();

      const newOrder = await this.orderModel.create(
        {
          orderNumber,
          userId: orderData.userId,
          merchantId: orderData.merchantId,
          addressId: orderData.addressId,
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          paymentMethod: orderData.paymentMethod,
          subTotal,
          deliveryFee,
          total,
          notes: orderData.note || null,
        } as Order,
        { transaction },
      );

      await this.createOrderItems(
        newOrder.id,
        orderData.orderItems,
        transaction,
      );

      await transaction.commit();

      return (await this.orderModel.findByPk(newOrder.id, {
        include: [
          {
            model: Address,
            attributes: ["city", "district", "ward", "street", "location"],
          },
          {
            model: User,
            attributes: ['email', 'phone'],
          },
          {
            model: OrderItem,
            include: [
              {
                model: Product,
                attributes: ['name', 'basePrice', 'image'],
              },
              {
                model: ProductVariant,
                attributes: ['name', 'size', 'type', 'modifiedPrice'],
              },
              {
                model: OrderItemTopping,
                include: [
                  {
                    model: Topping,
                    attributes: ['name', 'price'],
                  },
                ],
              },
            ],
          },
        ],
      })) as Order;
    } catch (error) {
      console.log(error.message);
      await transaction.rollback();
      throw error;
    }
  }

  async caculateSubtotal(
    orderItems: CreateOrderDto['orderItems'],
    transaction: any,
  ): Promise<number> {
    let subToal = 0;

    for (const item of orderItems) {
      let productPrice = 0;
      const product = await this.productModel.findByPk(item.productId, {
        transaction,
      });
      if (item.variantId) {
        const productVariant = await this.productVariantModel.findByPk(
          item.variantId,
          { transaction },
        );

        if (
          product &&
          product.dataValues &&
          productVariant &&
          productVariant.dataValues
        ) {
          productPrice =
            product?.dataValues?.basePrice +
            productVariant?.dataValues?.modifiedPrice;
        }
      } else {
        if (product && product.dataValues) {
          productPrice = product?.dataValues?.basePrice;
        }
      }
      let toppingPrice = 0;
      if (item.toppings) {
        for (const toppings of item.toppings) {
          const topping = await this.toppingModel.findByPk(
            toppings.toppingId,
            { transaction },
          );

          if (topping && topping.dataValues) {
            toppingPrice +=
              (topping?.dataValues?.price || 0) * toppings.quantity;
          }
        }
      }

      subToal += (productPrice + toppingPrice) * item.quantity;
    }

    return subToal;
  }

  async createOrderItems(
    orderId: number,
    orderItem: CreateOrderDto['orderItems'],
    transaction: any,
  ): Promise<void> {
    for (const item of orderItem) {
      const newOrderItem = await this.orderItemModel.create(
        {
          orderId,
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        } as OrderItem,
        { transaction },
      );

      if (item.toppings) {
        for (const toppings of item.toppings) {
          await this.orderItemToppingModel.create(
            {
              orderItemId: newOrderItem.id,
              toppingId: toppings.toppingId,
              quantity: toppings.quantity,
            } as OrderItemTopping,
            { transaction },
          );
        }
      }
    }
  }
}
