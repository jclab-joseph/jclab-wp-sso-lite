import { SignJWT, JWK, importJWK } from 'jose';
import {Controller, HttpException, HttpStatus, Logger, Post, Req, Body, Inject, Query} from '@nestjs/common';
import {AuthService} from '../service/auth';

interface DeviceInfo {
  aud: string[];
  scope: string[];
}

interface LoginRequest {
  type: string;
  username: string;
  password: string;
}

@Controller()
export class AuthController {
  private log: Logger;

  constructor(@Inject(AuthService) public authService: AuthService) {
    this.log = new Logger(AuthController.name);
  }

  @Post('/api/login')
  login(@Query('type') type: string, @Body() body: LoginRequest): Promise<string> {
    if (type === 'plain') {
      return this.authService.plainLogin(body.username, body.password)
        .then((result) => {
          console.log(result);
          return JSON.stringify(result);
        });
    } else {
      return Promise.resolve('NO');
    }
  }
}
