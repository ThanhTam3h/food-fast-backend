import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule, SequelizeModuleOptions } from '@nestjs/sequelize';
import { StartTimingMiddleware } from './common/middlewares/start-timing.middleware';
import { sequelizeConfig } from './config/sequelize.config';
import { AuthModule } from './modules/auth/auth.module';
import { CategoryModule } from './modules/category/category.module';
import { DroneModule } from './modules/drone/drone.module';
import { MerchantModule } from './modules/merchant/merchant.module';
import { ProductModule } from './modules/product/product.module';
import { UserModule } from './modules/user/user.module';
import { APP_GUARD } from '@nestjs/core';
import { JWTAuthGuard } from './modules/auth/guards/jwt.guard';
import { PassportModule } from '@nestjs/passport';

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
    DroneModule,
    ProductModule,
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
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JWTAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(StartTimingMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
