import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SequelizeModule, SequelizeModuleOptions } from '@nestjs/sequelize';
import { join } from 'path';
import { StartTimingMiddleware } from './common/middlewares/start-timing.middleware';
import { sequelizeConfig } from './config/sequelize.config';
import { AuthModule } from './modules/auth/auth.module';
import { JWTAuthGuard } from './modules/auth/guards/jwt.guard';
import { CategoryModule } from './modules/category/category.module';

import { MerchantModule } from './modules/merchant/merchant.module';

import { RolesGuard } from './common/decorators/roles.guard';
import { AddressModule } from './modules/address/address.module';
import { CartItemToppingModule } from './modules/cart-item-topping/cart-item-topping.module';
import { CartItemModule } from './modules/cart-item/cart-item.module';
import { CartPreviewModule } from './modules/cart-preview/cart-preview.module';
import { CartModule } from './modules/cart/cart.module';
import { OrderModule } from './modules/order/order.module';
import { ProductToppingModule } from './modules/product-topping/product-topping.module';
import { ProductVariantModule } from './modules/product-variant/product-variant.module';
import { ProductModule } from './modules/product/product.module';
import { StripeModule } from './modules/stripe/stripe.module';
import { ToppingModule } from './modules/topping/topping.module';
import { UserModule } from './modules/user/user.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): SequelizeModuleOptions =>
        sequelizeConfig(configService),
    }),
    CategoryModule,
    MerchantModule,
    UserModule,
    AuthModule,

    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<number>('JWT_EXPIRES_IN'),
        },
      }),
      global: true,
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASSWORD'),
          },
        },
        defaults: {
          from: '"No Reply" <no-reply@localhost>',
        },
        template: {
          dir: join(process.cwd(), 'src/templates/email'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
    ProductModule,
    ToppingModule,
    ProductToppingModule,
    ProductVariantModule,
    CartModule,
    CartItemModule,
    CartItemToppingModule,
    AddressModule,
    CartPreviewModule,
    OrderModule,
    StripeModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JWTAuthGuard,
    }, // xác thực trước
    { provide: APP_GUARD, useClass: RolesGuard }, // phân quyền sau
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(StartTimingMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });

    consumer
      .apply((req, res, next) => {
        console.log('Stripe middleware triggered for:', req.url);
        let data = '';
        req.setEncoding('utf8');
        req.on('data', (chunk) => (data += chunk));
        req.on('end', () => {
          req['rawBody'] = Buffer.from(data);
          console.log('Captured rawBody length:', req['rawBody'].length);
          next();
        });
      })
      .forRoutes({
        path: 'api/v1/stripe/webhook',
        // path: '*',
        method: RequestMethod.POST,
      });
  }
}
