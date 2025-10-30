import { Body, Controller, Get, Param } from '@nestjs/common';
import { CartItemToppingService } from './cart-item-topping.service';

@Controller('cart-topping')
export class CartToppingController {
  constructor(
    private readonly cartItemToppingService: CartItemToppingService,
  ) {}

  @Get('getone/:id')
  getOneCartItemTopping(
    @Param('id') id: number,
    @Body('toppingsId') ToppingsId: number[],
  ) {
    return this.cartItemToppingService.existedCartItemTopping(id, ToppingsId);
  }

  @Get('has-Topping/:cartitemid')
  getHasTopping(@Param('cartitemid') cartitemid: number) {
    return this.cartItemToppingService.hasTopping(cartitemid);
  }

  @Get('existed-cartitem-Topping')
  getExistedCartItem(
    @Body('ToppingsId') ToppingsId: number[],
    @Body('cartItemId') cartItemId: number,
  ) {
    return this.cartItemToppingService.existedCartItemTopping(
      cartItemId,
      ToppingsId,
    );
  }

  @Get('get-all')
  getAllCartItemTopping() {
    return this.cartItemToppingService.getAllCartItemTopping();
  }
}
