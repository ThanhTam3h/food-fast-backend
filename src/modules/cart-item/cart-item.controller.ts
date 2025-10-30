import {
  BadGatewayException,
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { CartItemService } from './cart-item.service';
import { CreateCartItemDto } from './dto/cart-item.dto';

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { Sequelize } from 'sequelize-typescript';
import { CartService } from '../cart/cart.service';
import { actionUpdateCartItem } from './types/cartItem.type';

@Controller('cart-item')
export class CartItemController {
  constructor(
    private readonly cartItemService: CartItemService,
    private readonly cartService: CartService,
    private readonly JWTservice: JwtService,
    private readonly configService: ConfigService,
    private readonly transaction: Sequelize,
  ) {}

  @Post('/addtocart')
  @ApiBearerAuth('access-token')
  async addToCart(
    @Body() dataAdd: CreateCartItemDto,
    @Res({ passthrough: true }) res: Response,
    // @Req() req: Request,
    // @GetUser('Topping') userId: number
  ) {
    // let userId: number | null = null;

    // const authHeader = req.headers?.authorization;

    // if (authHeader && authHeader.startsWith('Bearer ')) {
    //   try {
    //     const token = authHeader.substring(7);
    //     const decoded = this.JWTservice.verify(
    //       token,
    //       this.configService.get('JWT_SECRET'),
    //     ) as any;
    //     userId = decoded.Topping;
    //   } catch (error) {
    //     // Token invalid hoặc expired, treat as guest
    //     userId = null;
    //   }
    // }

    return await this.cartItemService.addToCart(dataAdd);
  }

  @Patch('/:cartItemId/quantity')
  @ApiBearerAuth('access-token')
  @ApiParam({
    name: 'cartItemId',
    type: Number,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['increment', 'decrement'],
        },
      },
    },
  })
  async updateQuantity(
    @Param('cartItemId') cartItemId: number,
    @Body('action') action: string,
  ) {
    return await this.cartItemService.increOrDecreQuantity(
      cartItemId,
      action as actionUpdateCartItem,
    );
  }

  @Delete('/:cartItemId')
  @ApiBearerAuth('access-token')
  async deleteCartItem(@Param('cartItemId') cartItemId: number) {
    return await this.cartItemService.deleteCartItem(cartItemId);
  }

  @Get('/mergecart')
  @ApiBearerAuth('access-token')
  async mergeCart(
    @Req() req: Request,
    @Res({ passthrough: true }) _res: Response,
  ) {
    const authBearer = req.headers?.authorization;
    if (!authBearer || !authBearer.startsWith('Bearer ')) {
      throw new BadRequestException('Thiếu token đăng nhập!');
    }

    const token = authBearer.substring(7);
    const decoded = this.JWTservice.verify(
      token,
      this.configService.get('JWT_SECRET'),
    ) as any;
    const userId = decoded.id;
    // const userId = (req.user as { Topping: number; role: string }).Topping;
    return await this.cartItemService.mergeCart(userId);
  }

  @Get('/get-cartitems')
  @ApiBearerAuth('access-token')
  async getCartItemsByUser(@Req() req: Request) {
    const transaction = await this.transaction.transaction();

    try {
      const authBearer = req.headers?.authorization;
      if (!authBearer || !authBearer.startsWith('Bearer ')) {
        throw new BadRequestException('Thiếu token đăng nhập!');
      }

      const token = authBearer.substring(7);
      const decoded = this.JWTservice.verify(
        token,
        this.configService.get('JWT_SECRET'),
      ) as any;
      const userId = decoded.id;

      const cart = await this.cartService.getCartByUserId(userId, transaction);

      if (!cart) {
        await transaction.commit();
        return { message: 'Giỏ hàng trống', data: [] };
      }

      const result = await this.cartItemService.getCartItemByCartId(
        cart.id,
        transaction,
      );

      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      if (error instanceof Error) {
        throw new BadGatewayException(error.message);
      }
      throw new BadGatewayException('Unknown error');
    }
  }

  // @Get('by-cart/:cartId')
  // @ApiBearerAuth('access-token')
  // async getCartItemByCartId(
  //   @Param('cartId') cartId: number,
  //   @Req() req: Request,
  // ) {
  //   const transaction = null;
  //   const result = await this.cartItemService.getCartItemByCartId(
  //     cartId,
  //     transaction,
  //   );
  //   return {
  //     success: true,
  //     message: result.message,
  //     data: result.data,
  //   };
  // }
}
