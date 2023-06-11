import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ShopModule } from './shop/shop.module';
import { MongooseModule } from '@nestjs/mongoose';
import { GracefulShutdownModule } from 'nestjs-graceful-shutdown';
import { Config } from './config/config';
import mongoose from 'mongoose';
import { validateAndThrow } from '../shop-shared-server/helpers/validate-and-throw';
import { redisClient } from '../shop-exchange-shared/redisConnection';

const logger: Logger = new Logger('AppModule');

@Module({
  imports: [
    GracefulShutdownModule.forRoot({
      cleanup: async () => {
        logger.log('Graceful shutdown...');
        await mongoose.disconnect();
        await redisClient.quit();
        logger.log('Graceful shutdown completed');
      },
    }),
    MongooseModule.forRoot(Config.get().mongo.url, Config.get().mongo.options),
    ShopModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor() {
    mongoose.plugin((schema, options) => {
      schema.post('save', async (doc) => {
        await validateAndThrow(doc);
      });
    });
  }
}
