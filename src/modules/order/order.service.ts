import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Helper } from 'src/common/helpers/helper';
import {
  Address,
  Drone,
  DroneHub,
  Merchant,
  Order,
  OrderItem,
  OrderItemTopping,
  Product,
  Topping,
  User,
} from 'src/models';
import { DroneStatus } from 'src/models/drone.model';
import { OrderStatus, PaymentStatus } from 'src/models/order.model';
import { AddressService } from '../address/address.service';
import { OrderStatusGateway } from '../websocket/order-status.gateway';
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
    @InjectModel(Drone) private readonly droneModel: typeof Drone,
    @InjectModel(DroneHub) private readonly droneHubModel: typeof DroneHub,
    private readonly addressService: AddressService,
    private readonly orderStatusGateway: OrderStatusGateway,
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

  async findAll() {
    return this.orderModel.findAll({
      include: [
        // ----- User -----
        {
          model: this.userModel,
          include: [
            {
              model: this.addressModel, // User.addresses
              as: 'addresses',
            },
          ],
        },

        // ----- Địa chỉ giao hàng của Order -----
        {
          model: this.addressModel,
          as: 'address',
        },

        // ----- Merchant -----
        {
          model: this.merchantModel,
          include: [
            {
              model: this.addressModel, // Merchant.address
              as: 'address',
            },
          ],
        },

        // ----- Drone -----
        {
          model: this.droneModel,
          include: [
            {
              model: this.droneHubModel,
              as: 'hub',
            },
          ],
        },

        // ----- OrderItems -----
        {
          model: this.orderItemModel,
          include: [
            {
              model: this.productModel,
            },
            {
              model: this.orderItemToppingModel,
              include: [
                {
                  model: Topping,
                },
              ],
            },
          ],
        },
      ],
    });
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

    // Emit realtime
    if (updateData.status) {
      const payload = {
        orderNumber,
        status: updateData.status,
        updatedAt: order.updatedAt,
      };
      this.orderStatusGateway.emitOrderStatusUpdate(orderNumber, payload);
    }

    return order;
  }

  async getAvailableDrones() {
    return this.droneModel.findAll({
      where: { status: DroneStatus.AVAILABLE },
      attributes: ['id', 'battery', 'serialNumber', 'payloadCapacityKg'],
    });
  }

  async assignDroneToOrder(
    orderNumber: string,
    droneId: number,
  ): Promise<Order> {
    const transaction = await this.sequelize.transaction();
    try {
      const order = await this.orderModel.findOne({
        where: { orderNumber, status: OrderStatus.CONFIRMED },
        transaction,
      });
      if (!order)
        throw new BadRequestException('Order not found or not confirmed');

      const drone = await this.droneModel.findOne({
        where: {
          id: droneId,
          status: DroneStatus.AVAILABLE,
          battery: { [Op.gte]: 20 },
        },
        transaction,
      });
      if (!drone) throw new BadRequestException('Drone not available');

      await order.update(
        { droneId: drone.id, status: OrderStatus.DELIVERING },
        { transaction },
      );
      await drone.update(
        { status: DroneStatus.FLYING_TO_PICKUP },
        { transaction },
      );
      await transaction.commit();

      // Emit realtime + bắt đầu hành trình
      this.orderStatusGateway.emitOrderStatusUpdate(orderNumber, {
        orderNumber,
        status: OrderStatus.DELIVERING,
        droneId: drone.id,
      });

      this.startDroneDeliveryJourney(order.id, drone.id, orderNumber);
      return order;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  private async startDroneDeliveryJourney(
    orderId: number,
    droneId: number,
    orderNumber: string,
  ) {
    const order = await this.orderModel.findByPk(orderId, {
      include: [
        {
          model: this.merchantModel,
          include: [{ model: this.addressModel, as: 'address' }],
        },
        { model: this.addressModel, as: 'address' },
      ],
    });

    if (!order || !order.merchant?.address || !order.address) {
      console.error('Thiếu thông tin địa chỉ đơn hàng');
      return;
    }

    const parseLocation = (location: any): [number, number] | null => {
      if (!location) return null;
      if (location.coordinates && Array.isArray(location.coordinates)) {
        return [location.coordinates[0], location.coordinates[1]];
      }
      if (typeof location === 'string') {
        try {
          const parsed = JSON.parse(location);
          if (parsed.coordinates)
            return [parsed.coordinates[0], parsed.coordinates[1]];
        } catch {}
      }
      return null;
    };

    const restaurantCoords = parseLocation(order.merchant.address.location);
    const customerCoords = parseLocation(order.address.location);

    if (!restaurantCoords || !customerCoords) {
      console.error('Không lấy được tọa độ!');
      return;
    }

    const hubCoords: [number, number] = [106.6972, 10.7758];

    const emitPosition = (lng: number, lat: number, phase: DroneStatus) => {
      this.orderStatusGateway.emitDronePosition(orderNumber, {
        droneId,
        position: [lng, lat],
        phase,
      });
    };

    const animateFlight = (
      from: [number, number],
      to: [number, number],
      duration: number,
      phase: DroneStatus,
    ) => {
      const steps = 80;
      const delay = duration / steps;
      let count = 0;

      const timer = setInterval(() => {
        count++;
        if (count > steps) {
          clearInterval(timer);
          return;
        }

        const progress = count / steps;
        const ease = 0.5 - 0.5 * Math.cos(progress * Math.PI);
        const lng = from[0] + (to[0] - from[0]) * ease;
        const lat = from[1] + (to[1] - from[1]) * ease;

        emitPosition(lng, lat, phase);
      }, delay);
    };

    console.log(`DRONE KHỞI HÀNH CHO ĐƠN ${orderNumber} - DRONE #${droneId}`);

    // === HÀNH TRÌNH DRONE THEO STATUS MỚI ===

    //  HUB → Nhà hàng
    animateFlight(
      hubCoords,
      restaurantCoords,
      10000,
      DroneStatus.FLYING_TO_PICKUP,
    );

    // Đến nhà hàng, nhận đồ
    setTimeout(() => {
      emitPosition(
        restaurantCoords[0],
        restaurantCoords[1],
        DroneStatus.AT_PICKUP_POINT,
      );
    }, 11000);

    // Bay đến khách
    setTimeout(() => {
      animateFlight(
        restaurantCoords,
        customerCoords,
        15000,
        DroneStatus.OUT_FOR_DELIVERY,
      );
    }, 16000);

    // Thả hàng
    setTimeout(() => {
      emitPosition(
        customerCoords[0],
        customerCoords[1],
        DroneStatus.DROPPING_OFF,
      );
    }, 32000);

    // Cập nhật đơn đã giao
    setTimeout(async () => {
      emitPosition(
        customerCoords[0],
        customerCoords[1],
        DroneStatus.DROPPING_OFF,
      );

      await this.orderModel.update(
        { status: OrderStatus.DELIVERED, paymentStatus: PaymentStatus.PAID },
        { where: { id: orderId } },
      );
      this.orderStatusGateway.emitOrderStatusUpdate(orderNumber, {
        orderNumber,
        status: OrderStatus.DELIVERED,
      });
    }, 35000);

    // Quay về HUB
    setTimeout(() => {
      animateFlight(
        customerCoords,
        hubCoords,
        12000,
        DroneStatus.RETURNING_TO_HUB,
      );
    }, 37000);

    // Hạ cánh tại HUB
    setTimeout(async () => {
      emitPosition(hubCoords[0], hubCoords[1], DroneStatus.LANDING_AT_HUB);

      const drone = await this.droneModel.findByPk(droneId);
      if (drone) {
        await drone.update({
          status: DroneStatus.AVAILABLE,
          battery: Math.max(20, drone.battery - 28),
        });
        this.orderStatusGateway.emitDroneStatus(droneId, DroneStatus.AVAILABLE);
      }
    }, 50000);
  }

  async getOrderItemsByOrderId(orderNumber: string) {
    try {
      const order = await this.orderModel.findAll({
        where: { orderNumber },
        attributes: { exclude: ['stripePaymentIntentId'] },
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
          // Chỉ include drone nếu order đã xác nhận (status !== 'PENDING')
          {
            model: this.droneModel,
            required: false, // nếu chưa gán drone thì vẫn trả về order
            include: [
              {
                model: this.droneHubModel,
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

  async getOrdersByMerchantId(merchantId: number, status?: string) {
    try {
      const whereClause: any = { merchantId };
      if (status) {
        whereClause.status = status;
      }

      const orders = await this.orderModel.findAll({
        where: whereClause,
        attributes: {
          exclude: ['stripePaymentIntentId'],
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
        order: [['createdAt', 'DESC']],
      });

      return orders;
    } catch (error) {
      console.error('Error getOrdersByMerchantId:', error);
      throw error;
    }
  }

  async getOrderItemsByUserId(userId: number) {
    try {
      const order = await this.orderModel.findAll({
        where: { userId },
        attributes: { exclude: ['stripePaymentIntentId'] },
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
          // Chỉ include drone nếu order đã xác nhận (status !== 'PENDING')
          {
            model: this.droneModel,
            required: false, // nếu chưa gán drone thì vẫn trả về order
            include: [
              {
                model: this.droneHubModel,
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
