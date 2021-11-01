import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import {INestApplication, Logger} from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { Callback, Context, Handler } from 'aws-lambda';
import { AppModule } from './app.module';
import express from 'express';
import serverlessExpress from '@vendia/serverless-express';
import WaitSignal from 'wait-signal';
import ConfigManager from './config';

const applicationSignal: WaitSignal<INestApplication> = new WaitSignal();

const logger = new Logger('Application');

async function initialize() {
  try {
    await ConfigManager.load();
    const expressApp = express();
    const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
    await app.init();
    if (ConfigManager.HTTP_PORT) {
      app.listen(ConfigManager.HTTP_PORT)
        .then(() => {
          logger.log(`Listen ${ConfigManager.HTTP_PORT}`);
        })
        .catch((err) => {
          logger.error('Error', err);
        })
    }
    applicationSignal.signal(app);
  } catch (e) {
    applicationSignal.throw(e);
  }
}
initialize();

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  const app = await applicationSignal.wait();
  const serverlessHandler = serverlessExpress({
    app: app.getHttpAdapter().getInstance()
  });
  return serverlessHandler(event, context, callback);
};
