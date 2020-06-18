import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as chalk from 'chalk';
import { getConnection } from 'typeorm';
import { express as voyagerMiddleware } from 'graphql-voyager/middleware';
import {
  PORT,
  NODE_ENV,
  DOMAIN,
  PRIMARY_COLOR,
  END_POINT,
  VOYAGER,
} from './environments';
import { MyLogger } from './config';
import {
  LoggingInterceptor,
  TimeoutInterceptor,
  ValidationPipe,
  LoggerMiddleware,
} from './common';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      logger: new MyLogger(),
    });

    // NOTE: database connect
    const connection = getConnection('default');
    const { isConnected } = connection;
    // connection.runMigrations();
    isConnected
      ? Logger.log(`🌨️  Database connected`, 'TypeORM', false)
      : Logger.error(`❌  Database connect error`, '', 'TypeORM', false);

    // NOTE: adapter for e2e testing
    app.getHttpAdapter();

    // NOTE:loggerMiddleware
    NODE_ENV !== 'testing' && app.use(LoggerMiddleware);

    // NOTE: voyager
    NODE_ENV !== 'production' &&
      app.use(
        `/${VOYAGER}`,
        voyagerMiddleware({
          displayOptions: {
            skipRelay: false,
            skipDeprecated: false,
          },
          endpointUrl: `/${END_POINT}`,
        }),
      );

    // NOTE: interceptors
    app.useGlobalInterceptors(new LoggingInterceptor());
    app.useGlobalInterceptors(new TimeoutInterceptor());

    // NOTE: global nest setup
    app.useGlobalPipes(new ValidationPipe());

    app.enableShutdownHooks();

    await app.listen(PORT);

    Logger.log(`Application is running on: ${await app.getUrl()}`);

    NODE_ENV !== 'production'
      ? (Logger.log(
          `🚀  Server ready at http://${DOMAIN}:${chalk
            .hex(PRIMARY_COLOR)
            .bold(PORT)}/${END_POINT}`,
          'Bootstrap',
          false,
        ),
        Logger.log(
          `🚀  Subscriptions ready at ws://${DOMAIN}:${chalk
            .hex(PRIMARY_COLOR)
            .bold(PORT)}/${END_POINT}`,
          'Bootstrap',
          false,
        ))
      : Logger.log(
          `🚀  Server is listening on port ${chalk
            .hex(PRIMARY_COLOR)
            .bold(PORT)}`,
          'Bootstrap',
          false,
        );
  } catch (error) {
    Logger.error(`❌  Error starting server, ${error}`, '', 'Bootstrap', false);
    process.exit();
  }
}
bootstrap().catch(e => {
  Logger.error(`❌  Error starting server, ${e}`, '', 'Bootstrap', false);
  throw e;
});
