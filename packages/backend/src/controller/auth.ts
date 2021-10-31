import {Controller, Logger, Post, Req, Body, Inject, Query} from '@nestjs/common';
import {UserAuthService} from '../service/user_auth';

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

  constructor(@Inject(UserAuthService) public userAuthService: UserAuthService) {
    this.log = new Logger(AuthController.name);
  }
}
