import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import {INestApplication, Logger} from '@nestjs/common';
import serverlessExpress from '@vendia/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';
import { AppModule } from './app.module';
import WaitSignal from 'wait-signal';
import { HTTP_PORT } from './envs';

const applicationSignal: WaitSignal<INestApplication> = new WaitSignal();

const logger = new Logger('Application');

async function initialize() {
  try {
    const app = await NestFactory.create(AppModule);
    await app.init();
    if (HTTP_PORT) {
      app.listen(HTTP_PORT)
        .then(() => {
          logger.log(`Listen ${HTTP_PORT}`);
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
