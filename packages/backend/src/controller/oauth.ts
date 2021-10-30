import {
  Controller,
  Logger,
  Post,
  Body,
  Inject,
  Query, HttpException, BadRequestException, Res, UnauthorizedException, Req
} from '@nestjs/common';
import * as url from 'url';
import * as uuid from 'uuid';
import {
  AuthService, LoginResult, RemoteInfo
} from '../service/auth';
import {
  Response
} from 'express';
import {AuthorizationCodeService} from '../service/authorization_code';

interface DeviceInfo {
  aud: string[];
  scope: string[];
}

type ResponseMode = 'query' | 'json';

interface AuthorizeRequest {
  responseType: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  state: string;
  grantType: 'password';
  username: string;
  password: string;
  scope: string; // tokenized by white space
}

interface AuthorizeResponse {
  redirectUri: string;
}

@Controller('/api/oauth')
export class OauthController {
  private log: Logger;

  constructor(
    @Inject(AuthService) public authService: AuthService,
    @Inject(AuthorizationCodeService) public authorizationCodeService: AuthorizationCodeService
  ) {
    this.log = new Logger(OauthController.name);
  }

  @Post('/authorize')
  login(
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
    if (body.grantType === 'password') {
      p = this.passwordLogin(remoteInfo, body);
    } else {
      p = Promise.reject(new BadRequestException('wrong grant type'));
    }
    const redirectUri = new url.URL(body.redirectUri);
    return p.then((loginResult) => {
      if (loginResult.result) {
        // 로그인 성공
        return this.authorizationCodeService.encryptCode(loginResult)
          .then((code) => {
            redirectUri.searchParams.append('code', code);
            if (responseMode === 'query') {
              res.redirect(redirectUri.toString());
            }
            res
              .status(200)
              .send({
                redirectUri: redirectUri.toString()
              } as AuthorizeResponse);
          });
      } else {
        // 로그인 실패
        // TODO: redirect
        return Promise.reject(new UnauthorizedException('wrong information'));
      }
    });
  }

  private passwordLogin(remoteInfo: RemoteInfo, body: AuthorizeRequest): Promise<LoginResult> {
    return this.authService.plainLogin(remoteInfo, body.username, body.password);
  }
}
