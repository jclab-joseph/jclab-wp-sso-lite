import {All, Controller, Get, Logger, Next, Post, Req, Res} from '@nestjs/common';
import {createProxyMiddleware, RequestHandler} from 'http-proxy-middleware';
import ConfigManager from '../config';

@Controller()
export class ProxyController {
  private log: Logger;
  private _proxy: RequestHandler | undefined = undefined;

  constructor() {
    this.log = new Logger(ProxyController.name);
    if (ConfigManager.FRONT_PROXY_URL) {
      this._proxy = createProxyMiddleware({
        target: ConfigManager.FRONT_PROXY_URL,
        secure: false
      });
    }
  }

  @Get('*')
  proxyRequest(@Req() req, @Res() res, @Next() next) {
    if (this._proxy) {
      this._proxy(req, res, next);
    } else {
      next();
    }
  }
}
