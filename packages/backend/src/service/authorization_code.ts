import {Injectable} from '@nestjs/common';
import * as util from 'util';
import {
  KeyLike,
  JWK,
  compactDecrypt,
  CompactEncrypt,
  importJWK,
  CompactDecryptGetKey,
  FlattenedJWE,
  JWEHeaderParameters
} from 'jose'
import {getEncryptionKey} from '../envs';
import {LoginResult} from './user_auth';

const encoder = new util.TextEncoder();
const decoder = new util.TextDecoder();

export interface AuthorizationCodeData {
  reqId: string;
  orgId: string;
  acntId: string;
  authId: string;
  time: number;
  clientId: string;
  scopes: string[];
}

const keySupplier: CompactDecryptGetKey = (protectedHeader: JWEHeaderParameters, token: FlattenedJWE): Promise<KeyLike | Uint8Array> => {
  return getEncryptionKey()
    .then((encryptionKeyJson) => importJWK({
      alg: 'dir',
      ...encryptionKeyJson
    } as JWK));
}

/**
 * oauth2 authorize 시 authorization_code 생성과
 * oauth2 token 으로 해당 authorization_code 를 받아 처리하는 부분
 *
 * authorization_code 는 JWE 를 통해 암호화 한다.
 */
@Injectable()
export class AuthorizationCodeService {
  public encryptCode(reqId: string, clientId: string, loginResult: LoginResult): Promise<string> {
    const plainText: AuthorizationCodeData = {
      reqId: reqId,
      orgId: loginResult.result && loginResult.orgId,
      acntId: loginResult.result && loginResult.acntId,
      authId: loginResult.result && loginResult.authId,
      scopes: loginResult.result && loginResult.scopes,
      time: new Date().getTime(),
      clientId: clientId
    };
    return getEncryptionKey()
      .then((encryptionKeyJson) => {
        return importJWK({
          alg: 'dir',
          ...encryptionKeyJson
        } as JWK)
          .then((secretKey) => {
            return new CompactEncrypt(encoder.encode(JSON.stringify(plainText)))
              .setProtectedHeader({alg: 'dir', enc: encryptionKeyJson.enc})
              .encrypt(secretKey);
          });
      })
  }

  public decryptCode(code: string): Promise<AuthorizationCodeData> {
    return compactDecrypt(code, keySupplier)
      .then((decryptResult) => {
        try {
          return JSON.parse(decoder.decode(decryptResult.plaintext)) as AuthorizationCodeData;
        } catch (e) {
          return Promise.reject(e);
        }
      });
  }
}
