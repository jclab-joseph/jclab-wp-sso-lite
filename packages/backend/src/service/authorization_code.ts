import {Injectable} from '@nestjs/common';
import * as util from 'util';
import {compactDecrypt, CompactEncrypt, importJWK, JWK, CompactDecryptGetKey} from 'jose'
import {getEncryptionKey} from '../envs';
import {LoginResult} from './auth';
import {FlattenedJWE, JWEHeaderParameters, KeyLike} from 'jose/dist/types/types';

const encoder = new util.TextEncoder();
const decoder = new util.TextDecoder();

export interface AuthorizationCodeData {
  requestId: string;
  orgId: string;
  acntId: string;
  authId: string;
  time: number;
}

const keySupplier: CompactDecryptGetKey = (protectedHeader: JWEHeaderParameters, token: FlattenedJWE): Promise<KeyLike | Uint8Array> => {
  return getEncryptionKey()
    .then((encryptionKeyJson) => importJWK(encryptionKeyJson as JWK));
}

/**
 * oauth2 authorize 시 authorization_code 생성과
 * oauth2 token 으로 해당 authorization_code 를 받아 처리하는 부분
 *
 * authorization_code 는 JWE 를 통해 암호화 한다.
 */
@Injectable()
export class AuthorizationCodeService {
  public encryptCode(loginResult: LoginResult): Promise<string> {
    const plainText: AuthorizationCodeData = {
      requestId: loginResult.requestId,
      orgId: loginResult.result && loginResult.orgId,
      acntId: loginResult.result && loginResult.acntId,
      authId: loginResult.result && loginResult.authId,
      time: new Date().getTime()
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

  public decryptCode(code: string) {
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
