import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Helper } from 'src/common/helpers/helper';
import {
  Address,
  Merchant,
  Order,
  OrderItem,
  OrderItemTopping,
  Product,
  Topping,
  User,
} from 'src/models';
import { OrderStatus, PaymentStatus } from 'src/models/order.model';
import { AddressService } from '../address/address.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order) private readonly orderModel: typeof Order,
    @InjectModel(OrderItem) private readonly orderItemModel: typeof OrderItem,
    @InjectModel(OrderItemTopping)
    private readonly orderItemToppingModel: typeof OrderItemTopping,
    @InjectModel(Address) private readonly addressModel: typeof Address,
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Merchant) private readonly merchantModel: typeof Merchant,
    @InjectModel(Product) private readonly productModel: typeof Product,
    @InjectModel(Topping) private readonly toppingModel: typeof Topping,
    private readonly addressService: AddressService,
    private readonly sequelize: Sequelize,
  ) {}

  async createOrder(orderData: CreateOrderDto): Promise<Order> {
    const transaction = await this.sequelize.transaction();

    try {
      // Tạo address mới
      const newAddress = await this.addressService.create(
        orderData.userId,
        orderData.temporaryAddress,
      );
      const addressId = newAddress.id;

      // Tính phí giao hàng
      const deliveryFee = Helper.caculateDeliveryFee(orderData.distance);

      // Tính subtotal
      let subTotal = 0;
      for (const item of orderData.orderItems) {
        const product = await this.productModel.findByPk(item.productId, {
          transaction,
        });
        if (!product)
          throw new BadRequestException(`Product ${item.productId} not found`);

        let toppingPrice = 0;
        if (item.toppings) {
          for (const toppingItem of item.toppings) {
            const topping = await this.toppingModel.findByPk(
              toppingItem.toppingId,
              { transaction },
            );
            if (!topping)
              throw new BadRequestException(
                `Topping ${toppingItem.toppingId} not found`,
              );
            toppingPrice += (topping.price || 0) * toppingItem.quantity;
          }
        }

        subTotal += (product.basePrice + toppingPrice) * item.quantity;
      }

      const total = subTotal + deliveryFee;

      // Tạo order
      const orderNumber = await Helper.generateOrderNumber();
      const newOrder = await this.orderModel.create(
        {
          orderNumber,
          userId: orderData.userId,
          merchantId: orderData.merchantId,
          addressId,
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

      // Tạo order items & toppings
      for (const item of orderData.orderItems) {
        const orderItem = await this.orderItemModel.create(
          {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
          } as OrderItem,
          { transaction },
        );

        if (item.toppings) {
          for (const toppingItem of item.toppings) {
            await this.orderItemToppingModel.create(
              {
                orderItemId: orderItem.id,
                toppingId: toppingItem.toppingId,
                quantity: toppingItem.quantity,
              } as OrderItemTopping,
              { transaction },
            );
          }
        }
      }

      await transaction.commit();

      // Trả về order với relation
      return (await this.orderModel.findByPk(newOrder.id, {
        include: [
          { model: Address, attributes: ['street', 'location'] },
          { model: User, attributes: ['email', 'phone'] },
          {
            model: OrderItem,
            include: [
              { model: Product, attributes: ['name', 'basePrice', 'image'] },
              {
                model: OrderItemTopping,
                include: [{ model: Topping, attributes: ['name', 'price'] }],
              },
            ],
          },
        ],
      })) as Order;
    } catch (error) {
      await transaction.rollback();
      console.error('Create order error:', error);
      throw new BadRequestException(error.message);
    }
  }

  async caculateSubtotal(
    orderItems: CreateOrderDto['orderItems'],
    transaction: any,
  ): Promise<number> {
    let subTotal = 0;

    console.log(orderItems);

    for (const item of orderItems) {
      console.log(item.productId);
      // Lấy product
      const product = await this.productModel.findByPk(item.productId, {
        transaction,
      });

      console.log(product);
      if (!product) {
        throw new Error(`Product with id ${item.productId} not found`);
      }

      const productPrice = product.basePrice || 0;

      // Tính topping
      let toppingPrice = 0;
      if (item.toppings) {
        for (const toppingItem of item.toppings) {
          const topping = await this.toppingModel.findByPk(
            toppingItem.toppingId,
            { transaction },
          );
          if (!topping) {
            throw new Error(
              `Topping with id ${toppingItem.toppingId} not found`,
            );
          }
          toppingPrice += (topping.price || 0) * toppingItem.quantity;
        }
      }

      // Tính subtotal cho item
      subTotal += (productPrice + toppingPrice) * item.quantity;
    }

    return subTotal;
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

  async updateOrderInfo(orderNumber: string, updateData: Partial<Order>) {
    const order = await this.orderModel.findOne({ where: { orderNumber } });
    if (!order) throw new NotFoundException('Order not found');

    Object.assign(order, updateData);
    await order.save();
    return order;
  }

  async getOrderItemsByOrderId(orderNumber: string) {
    try {
      const order = await this.orderModel.findAll({
        where: { orderNumber },
        attributes: {
          exclude: ['stripePaymentIntentId'], // Exclude these attributes
        },
        include: [
          {
            model: this.merchantModel,
            attributes: ['id', 'name'],
            include: [
              {
                model: this.addressModel,
                attributes: ['id', 'street', 'location'],
              },
            ],
          },
          {
            model: this.userModel,
            attributes: ['id', 'email', 'phone'],
          },
          {
            model: this.addressModel,
            attributes: ['id', 'street', 'location'],
          },
          {
            model: this.orderItemModel,
            include: [
              {
                model: this.productModel,
                attributes: ['id', 'name', 'basePrice', 'image'],
              },
              {
                model: this.orderItemToppingModel,
                include: [
                  {
                    model: Topping,
                    attributes: ['id', 'name', 'price'],
                  },
                ],
              },
            ],
          },
        ],
      });
      return order;
    } catch (error) {
      throw error;
    }
  }
}
