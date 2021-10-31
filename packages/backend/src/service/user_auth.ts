import * as crypto from 'crypto';
import * as util from 'util';
import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {AuthenticationRepository} from '../repository/authentication';
import {OrgRepository} from '../repository/org';
import {OrgRootRepository} from '../repository/org_root';
import {AccountRepository} from '../repository/account';
import {Authentication} from '../entity/authentication';
import {LoginLogRepository} from '../repository/login_log';
import {LoginLog, LoginLogResult} from '../entity/login_log';

export interface RemoteInfo {
  requestId: string;
  address: string;
  useragent: string;
}

export interface LoginFailResult {
  result: false;
}

export interface LoginSuccResult {
  result: true;
  orgId: string;
  acntId: string;
  authId: string;
  scopes: string[];
}

export type LoginResult = LoginSuccResult | LoginFailResult;

//const crypto = require('crypto');
// crypto.pbkdf2('secret', 'salt', 100000, 64, 'sha256', (err, derivedKey) => {
//   if (err) throw err;
//   console.log(derivedKey.toString('hex'));  // '3745e48...08d59ae'
// });

function b64UrlToNormalize(input: string): string {
  let out = input
    .replace(/\./g, '+')
    .replace(/_/g, '/');
  const padding = out.length % 3;
  if (padding) {
    out += '='.repeat(3 - padding);
  }
  return out;
}

function verifyPassword(stored: string, input: string): Promise<boolean> {
  const tokens = stored.split('$');
  if (tokens[1].startsWith('pbkdf2-')) {
    const iterations = parseInt(tokens[2]);
    const salt = Buffer.from(b64UrlToNormalize(tokens[3]), 'base64');
    const hash = Buffer.from(b64UrlToNormalize(tokens[4]), 'base64');
    return util.promisify(crypto.pbkdf2)(input, salt, iterations, hash.length, tokens[1].substr(7))
      .then((res) => res.equals(hash));
  }
  return Promise.reject(new Error('Not supported algorithm: ' + tokens[1]));
}

@Injectable()
export class UserAuthService {
  constructor(
    @InjectRepository(OrgRepository) private readonly orgRepository: OrgRepository,
    @InjectRepository(OrgRootRepository) private readonly orgRootRepository: OrgRootRepository,
    @InjectRepository(AccountRepository) private readonly accountRepository: AccountRepository,
    @InjectRepository(AuthenticationRepository) private readonly authenticationRepository: AuthenticationRepository,
    @InjectRepository(LoginLogRepository) private readonly loginLogRepository: LoginLogRepository
  ) {

  }

  public loggingNoUser(remoteInfo: RemoteInfo, username: string) {
    const log = new LoginLog();
    log.username = username;
    log.result = LoginLogResult.FAILED_NO_USER;
    log.reqId = remoteInfo.requestId;
    log.remoteAddress = remoteInfo.address;
    log.userAgent = remoteInfo.useragent;
    return this.loginLogRepository.save(log);
  }

  public loggingWrongPassword(remoteInfo: RemoteInfo, row: Authentication) {
    const log = new LoginLog();
    log.username = row.username;
    log.account = Promise.resolve(row.account);
    log.result = LoginLogResult.FAILED_WRONG_PASSWORD;
    log.reqId = remoteInfo.requestId;
    log.remoteAddress = remoteInfo.address;
    log.userAgent = remoteInfo.useragent;
    return this.loginLogRepository.save(log);
  }

  public loggingSucc(remoteInfo: RemoteInfo, row: Authentication) {
    const log = new LoginLog();
    log.username = row.username;
    console.log('row.account: ', row.account);
    log.account = Promise.resolve(row.account);
    log.result = LoginLogResult.SUCCESS;
    log.reqId = remoteInfo.requestId;
    log.remoteAddress = remoteInfo.address;
    log.userAgent = remoteInfo.useragent;
    return this.loginLogRepository.save(log);
  }

  public plainLogin(remoteInfo: RemoteInfo, username: string, password: string): Promise<LoginResult> {
    return this.authenticationRepository.findOne({
      where: {
        authType: 'plain',
        username: username
      }
    })
      .then((row) => {
        if (!row) {
          this.loggingNoUser(remoteInfo, username);
          return {
            result: false
          };
        }
        return row.account.authorizations.then((authorizations) => verifyPassword(row.password, password)
          .then((result) => {
            if (result) {
              this.loggingSucc(remoteInfo, row);
              return {
                result: true,
                orgId: row.account.org.orgId,
                acntId: row.account.acntId,
                authId: row.authId,
                scopes: authorizations.map(v => v.scope)
              };
            } else {
              this.loggingWrongPassword(remoteInfo, row);
              return {
                result: false
              };
            }
          })
        );
      });
  }
}
