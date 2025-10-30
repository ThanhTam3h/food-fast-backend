import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { CartItemTopping, Topping } from 'src/models';

@Injectable()
export class CartItemToppingService {
  constructor(
    @InjectModel(Topping)
    private readonly modelTopping: typeof Topping,
    @InjectModel(CartItemTopping)
    private readonly modelCartItemTopping: typeof CartItemTopping,
  ) {}

  async existedCartItemTopping(idCartItem: number, idTopping: number[]) {
    if (!idCartItem) throw new Error('CartItem Topping không được tìm thấy!!!');
    if (!idTopping || idTopping.length === 0) {
      return false; 
    }

    const cartItemToppingInstance = await this.getCartItemTopping(idCartItem);
    const cartItemTopping = cartItemToppingInstance.map(
      (item) => item?.dataValues?.toppingId,
    );

    // So sánh độ dài
    if (cartItemTopping.length !== idTopping.length) {
      return false;
    }

    // Sort cả 2 mảng để tránh ảnh hưởng bởi thứ tự
    const sortedCart = [...cartItemTopping].sort((a, b) => a - b);
    const sortedId = [...idTopping].sort((a, b) => a - b);

    // So sánh từng phần tử
    const isEqual = sortedCart.every((val, index) => val === sortedId[index]);
    // console.log('isEqual', isEqual);

    // Nếu giống nhau thì trả về instance, ngược lại false
    return isEqual ? cartItemToppingInstance : false;
  }

  async returnDataHasTopping(idCartItem: number[]) {
    const cartItem = await this.modelCartItemTopping.findAll({
      where: {
        cartItemId: {
          [Op.in]: idCartItem,
        },
      },
    });
    return cartItem;
  }

  async getCartItemTopping(idCartItem: number) {
    return await this.modelCartItemTopping.findAll({
      where: {
        cartItemId: idCartItem,
      },
    });
  }

  async getAllCartItemTopping() {
    return await this.modelCartItemTopping.findAll();
  }

  async hasTopping(cartItem: number): Promise<boolean> {
    const count = await this.modelCartItemTopping.count({
      where: {
        cartItemId: cartItem,
      },
    });
    return count > 0;
  }
}
