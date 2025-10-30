import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Cart } from 'src/models';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart) private readonly modelCart: typeof Cart,
    private readonly sequelize: Sequelize,
  ) {}
  async getOrCreateUserCart(
    userId: number,
    merchantId: number,
    transaction: any,
  ) {
    let cart = await this.modelCart.findOne({
      where: { userId, merchantId },
      transaction: transaction,
    });

    if (!cart) {
      cart = await this.modelCart.create({ userId, merchantId } as Cart, {
        transaction: transaction,
      });
    }

    return cart;
  }

  async getCartByUserId(
    userId: number,
    transaction: any,
  ): Promise<Cart | null> {
    return await this.modelCart.findOne({
      where: { userId },
      transaction,
    });
  }
}
