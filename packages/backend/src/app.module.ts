import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common';
import {OrmFeatureModule, OrmRootModule} from './config';
import {KeysController} from './controller/keys';
import {AuthController} from './controller/auth';
import {OauthController} from './controller/oauth';
import {LoggerMiddleware} from './logger.middleware';
import {AuthService} from './service/auth';
import {AuthorizationCodeService} from './service/authorization_code';
import {ProxyController} from './controller/proxy';

@Module({
  imports: [OrmRootModule, OrmFeatureModule],
  providers: [AuthorizationCodeService, AuthService],
  controllers: [KeysController, AuthController, OauthController, ProxyController]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*');
  }
}
