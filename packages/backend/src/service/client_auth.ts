import * as util from 'util';
import * as crypto from 'crypto';
import {Inject, Injectable} from '@nestjs/common';
import {
  JWK,
  compactVerify, importJWK, CompactVerifyResult
} from 'jose'
import {OAuthClientPublicKeyRepository} from '../repository/oauth_client_public_key';

const encoder = new util.TextEncoder();

export interface ClientInfo {
  name: string;
  audience: string;
  publicKey: string;
}

@Injectable()
export class ClientAuthService {
  constructor(
    @Inject(OAuthClientPublicKeyRepository) public oauthClientPublicKeyRepository: OAuthClientPublicKeyRepository
  ) {
  }

  public findClientName(clientId: string): Promise<string | undefined> {
    return this.oauthClientPublicKeyRepository.findOne(clientId)
      .then((row) => {
        return row && row.name;
      });
  }

  public verify(clientId: string, clientSecret: string, payloadMap: Record<string, string>): Promise<ClientInfo | null> {
    if (!clientSecret.startsWith('_')) {
      return Promise.reject(new Error('wrong token'));
    }
    return this.oauthClientPublicKeyRepository.findOne(clientId)
      .then((row) => {
        if (!row) {
          return null;
        }
        return importJWK(JSON.parse(row.publicKey) as JWK)
          .then((publicKey) => compactVerify(clientSecret.substring(1), publicKey))
          .then((decodedToken) => {
            if (decodedToken.protectedHeader.ver === 1) {
              return this.verifyV1Payload(decodedToken, payloadMap);
            }
            return null;
          })
          .then((verified) => {
            if (!verified) return null;
            return {
              name: row.name,
              audience: row.audience,
              publicKey: row.publicKey
            } as ClientInfo;
          });
      });
  }

  private verifyV1Payload(decodedToken: CompactVerifyResult, payloadMap: Record<string, string>): boolean {
    const sortedKeys = Object.keys(payloadMap)
      .sort((x, y) => {
        if(x < y) { return -1; }
        if(x > y) { return  1; }
        return 0;
      });
    const payload = sortedKeys
      .reduce((list, cur) => {
        list.push(cur + '=' + payloadMap);
        return list;
      }, [])
      .join(';');
    const hash = crypto.createHash('sha256')
      .update(encoder.encode(payload))
      .digest();
    return hash.equals(decodedToken.payload);
  }
}
