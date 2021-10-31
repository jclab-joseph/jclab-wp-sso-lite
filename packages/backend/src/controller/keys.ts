import {Controller, Get, Header} from '@nestjs/common';
import {getPublicKeys} from '../envs';

@Controller()
export class KeysController {
  constructor() {

  }

  @Get('/api/jwks.json')
  @Header('Content-Type', 'application/json; charset=utf-8')
  getJwksJson(): Promise<string> {
    return getPublicKeys();
  }
}
