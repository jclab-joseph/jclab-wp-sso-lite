import {
  Controller,
  Logger,
  Post,
  Res,
  Req,
  Get,
  Body,
  Inject,
  Query,
  BadRequestException,
  UnauthorizedException
} from '@nestjs/common';
import { TextEncoder } from 'util';
import * as url from 'url';
import * as querystring from 'querystring';
import * as uuid from 'uuid';
import {
  Request,
  Response
} from 'express';
import {
  CompactSign, importJWK, JWK
} from 'jose';
import ConfigManager from '../config';
import {
  UserAuthService, LoginResult, RemoteInfo
} from '../service/user_auth';
import {AuthorizationCodeService} from '../service/authorization_code';
import {ClientAuthService} from '../service/client_auth';

interface AccessTokenData {
  jti: string;
  iat: number;
  exp: number;
  aud: string;
  scope: string[];
  'https://wp-lite.jc-lab.net/jwt/org_id': string;
  'https://wp-lite.jc-lab.net/jwt/acnt_id': string;
  'https://wp-lite.jc-lab.net/jwt/auth_id': string;
}

type ResponseMode = 'query' | 'json';

interface AuthorizeRequest {
  response_type: string;
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  state: string;
  grant_type: 'password';
  username: string;
  password: string;
  scope: string; // tokenized by white space
}

interface AuthorizeResponse {
  redirect_uri: string;
}

interface AccessTokenIssueResponse {
  access_token: string;
  refresh_token: string | undefined;
  token_type: 'bearer';
  expires_in: number;
}

interface AccessTokenRefreshResponse {
  access_token: string;
  token_type: 'bearer';
  expires_in: number;
}

const encoder = new TextEncoder();

@Controller('/api/oauth')
export class OauthController {
  private log: Logger;

  constructor(
    @Inject(UserAuthService) public authService: UserAuthService,
    @Inject(AuthorizationCodeService) public authorizationCodeService: AuthorizationCodeService,
    @Inject(ClientAuthService) public clientAuthService: ClientAuthService
  ) {
    this.log = new Logger(OauthController.name);
  }

  @Get('/client-name')
  getClientName(
    @Query('client_id') clientId: string
  ) {
    return this.clientAuthService.findClientName(clientId);
  }

  @Get('/authorize')
  getAuthorize(
    @Req() req: Request,
    @Res() res: Response
  ) {
    res.redirect('/oauth/authorize?' + querystring.stringify(req.query as any));
  }

  @Post('/authorize')
  postAuthorize(
    @Query('response_mode') responseMode: ResponseMode,
    @Body() body: AuthorizeRequest,
    @Req() req: Request,
    @Res() res: Response
  ): Promise<void> {
    let p: Promise<LoginResult>;
    const remoteInfo: RemoteInfo = {
      requestId: uuid.v4(),
      address: req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || (req as any).connection.remoteAddress,
      useragent: req.headers['user-agent']
    };
    if (body.grant_type === 'password') {
      p = this.passwordLogin(remoteInfo, body);
    } else {
      p = Promise.reject(new BadRequestException('wrong grant type'));
    }
    const redirectUri = new url.URL(body.redirect_uri);
    return p.then((loginResult) => {
      if (loginResult.result) {
        // ????????? ??????
        return this.authorizationCodeService.encryptCode(
          remoteInfo.requestId,
          body.client_id,
          loginResult
        )
          .then((code) => {
            redirectUri.searchParams.append('code', code);
            if (responseMode === 'query') {
              res.redirect(redirectUri.toString());
            }
            res
              .status(200)
              .send({
                redirect_uri: redirectUri.toString()
              } as AuthorizeResponse);
          });
      } else {
        // ????????? ??????
        // TODO: redirect
        return Promise.reject(new UnauthorizedException('wrong information'));
      }
    });
  }

  // clientSecret: HMAC(data=client_id.grant_type.code.state, secret=client_secret)
  @Get('/token')
  getToken(
    @Query('grant_type') grantType: string,
    @Query('client_id') clientId: string,
    @Query('client_secret') clientSecret: string,
    @Query('code') code: string,
    @Query('state') state: string
  ): Promise<AccessTokenIssueResponse> {
    const now = new Date().getTime();
    return this.clientAuthService.verify(clientId, clientSecret, {
      grantType,
      code,
      state
    })
      .then((clientInfo) => {
        if (!clientInfo) {
          return Promise.reject(new BadRequestException('invalid client authentication'));
        }
        return this.authorizationCodeService.decryptCode(code)
          .then((decryptedCode) => {
            const timeDiff = (now - decryptedCode.time) / 1000;
            if (timeDiff > 18000) {
              this.log.warn(`Old authorize code: ${JSON.stringify(decryptedCode)}`);
              return Promise.reject(new BadRequestException('revoked token'));
            }
            if (clientId != decryptedCode.clientId) {
              this.log.warn(`different client id: ${JSON.stringify(decryptedCode)}`);
              return Promise.reject(new BadRequestException('invalid token'));
            }
            const expiresIn = 3600;
            const accessTokenId = uuid.v4();
            const accessTokenData: AccessTokenData = {
              jti: accessTokenId,
              iat: Math.floor(now / 1000),
              exp: Math.floor(now / 1000) + expiresIn,
              aud: clientInfo.audience,
              'https://wp-lite.jc-lab.net/jwt/org_id': decryptedCode.orgId,
              'https://wp-lite.jc-lab.net/jwt/acnt_id': decryptedCode.acntId,
              'https://wp-lite.jc-lab.net/jwt/auth_id': decryptedCode.authId,
              scope: decryptedCode.scopes
            };

            // TODO: Redis??? Token Store??? ????????? ???
            // TODO: MYSQL??? Refresh Token ??????

            return Promise.all([this.signToken(accessTokenData)])
              .then(([accessToken]) => ({
                access_token: accessToken,
                token_type: 'bearer',
                expires_in: 3600
              } as AccessTokenIssueResponse));
          })
      });
  }

  private passwordLogin(remoteInfo: RemoteInfo, body: AuthorizeRequest): Promise<LoginResult> {
    return this.authService.plainLogin(remoteInfo, body.username, body.password);
  }

  private signToken(data: AccessTokenData): Promise<string> {
    return ConfigManager.getPrivateKey()
      .then((text) => JSON.parse(text))
      .then((jwk: JWK) => importJWK(jwk)
        .then((privateKey) => {
          return new CompactSign(encoder.encode(JSON.stringify(data)))
            .setProtectedHeader({
              alg: jwk.alg,
              kid: jwk.kid
            })
            .sign(privateKey);
        })
      );
  }
}
