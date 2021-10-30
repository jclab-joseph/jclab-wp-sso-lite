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

export const OrmRootModule = TypeOrmModule.forRoot({
  type: 'mariadb',
  host: DB_HOST,
  port: DB_PORT,
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_NAME,
  synchronize: true,
  logging: 'all',
  entities: [
    Org,
    Account,
    OrgRoot,
    Authentication,
    LoginLog
  ]
});

export const OrmFeatureModule = TypeOrmModule.forFeature([
  OrgRepository,
  AccountRepository,
  OrgRootRepository,
  AuthenticationRepository,
  LoginLogRepository
]);
