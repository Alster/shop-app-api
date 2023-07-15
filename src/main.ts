// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();

import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { setupGracefulShutdown } from "nestjs-graceful-shutdown";

import { AppModule } from "./app.module";
import { Config } from "./config/config";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	setupGracefulShutdown({ app });
	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			enableDebugMessages: true,
		}),
	);
	if (Config.env === "local") {
		app.enableCors();
	}
	await app.listen(Config.get().port);
}
bootstrap();
