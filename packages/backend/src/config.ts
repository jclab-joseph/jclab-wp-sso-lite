import { TypeOrmModule } from '@nestjs/typeorm';
import {
  DB_HOST,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  DB_NAME
} from './envs';
import {Org} from './entity/org';
import {OrgRoot} from './entity/org_root';
import {Account} from './entity/account';
import {Authentication} from './entity/authentication';
import {OrgRepository} from './repository/org';
import {AccountRepository} from './repository/account';
import {AuthenticationRepository} from './repository/authentication';
import {OrgRootRepository} from './repository/org_root';
import {LoginLogRepository} from './repository/login_log';
import {LoginLog} from './entity/login_log';
import {OAuthClientPublicKeyRepository} from './repository/oauth_client_public_key';
import {OAuthClientPublicKey} from './entity/oauth_client_public_key';
import {AccountAuthorization} from './entity/account_authorization';
import {AccountAuthorizationRepository} from './repository/account_authorization';

export const OrmRootModule = TypeOrmModule.forRoot({
  type: 'mariadb',
  host: DB_HOST,
  port: DB_PORT,
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_NAME,
  timezone: 'Z',
  synchronize: true,
  logging: 'all',
  entities: [
    Org,
    Account,
    OrgRoot,
    AccountAuthorization,
    Authentication,
    LoginLog,
    OAuthClientPublicKey
  ]
});

export const OrmFeatureModule = TypeOrmModule.forFeature([
  OrgRepository,
  AccountRepository,
  OrgRootRepository,
  AccountAuthorizationRepository,
  AuthenticationRepository,
  LoginLogRepository,
  OAuthClientPublicKeyRepository
]);
