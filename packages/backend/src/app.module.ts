import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common';
import {OrmFeatureModule, OrmRootModule} from './config';
import {KeysController} from './controller/keys';
import {OauthController} from './controller/oauth';
import {LoggerMiddleware} from './logger.middleware';
import {UserAuthService} from './service/user_auth';
import {ClientAuthService} from './service/client_auth';
import {AuthorizationCodeService} from './service/authorization_code';
import {ProxyController} from './controller/proxy';

@Module({
  imports: [OrmRootModule, OrmFeatureModule],
  providers: [AuthorizationCodeService, UserAuthService, ClientAuthService],
  controllers: [KeysController, OauthController, ProxyController]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*');
  }
}
