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
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { DroneHubModule } from './modules/drone-hub/drone-hub.module';
import { DroneModule } from './modules/drone/drone.module';
import { OrderModule } from './modules/order/order.module';
import { ProductToppingGroupModule } from './modules/product-topping-group/product-topping-group.module';
import { ProductModule } from './modules/product/product.module';
import { StripeModule } from './modules/stripe/stripe.module';
import { ToppingGroupModule } from './modules/topping-group/topping-group.module';
import { ToppingModule } from './modules/topping/topping.module';
import { UserModule } from './modules/user/user.module';
import { WebsocketModule } from './modules/websocket/websocket.module';

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
    CartModule,
    CartItemModule,
    CartItemToppingModule,
    AddressModule,
    CartPreviewModule,
    OrderModule,
    StripeModule,
    ToppingGroupModule,
    ProductToppingGroupModule,
    CloudinaryModule,
    WebsocketModule,
    DroneModule,
    DroneHubModule,
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
        let data = '';
        req.setEncoding('utf8');
        req.on('data', (chunk) => (data += chunk));
        req.on('end', () => {
          req['rawBody'] = Buffer.from(data);
          next();
        });
      })
      .forRoutes({
        path: 'api/v1/stripe/webhook',
        method: RequestMethod.POST,
      });
  }
}
