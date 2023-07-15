import { Logger, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { GracefulShutdownModule } from "nestjs-graceful-shutdown";

import { redisClient } from "../shop-exchange-shared/redisConnection";
import { validateAndThrow } from "../shop-shared-server/helpers/validateAndThrow";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { Config } from "./config/config";
import { ShopModule } from "./shop/shop.module";

const logger: Logger = new Logger("AppModule");

@Module({
	imports: [
		GracefulShutdownModule.forRoot({
			cleanup: async () => {
				logger.log("Graceful shutdown...");
				await mongoose.disconnect();
				await redisClient.quit();
				logger.log("Graceful shutdown completed");
			},
			gracefulShutdownTimeout: 30 * 1000,
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
			schema.post("save", async (document) => {
				await validateAndThrow(document);
			});
		});
	}
}
