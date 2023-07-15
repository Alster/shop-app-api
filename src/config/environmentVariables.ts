import { MongooseModuleOptions } from "@nestjs/mongoose/dist/interfaces/mongoose-options.interface";
import { IsObject, IsPort, IsString, IsUrl } from "class-validator";

export class MongoConfig {
	@IsUrl()
	readonly url!: string;

	@IsObject()
	readonly options!: MongooseModuleOptions;
}

export class EnvironmentVariables {
	@IsPort()
	readonly port!: string;

	@IsObject()
	readonly mongo!: MongoConfig;

	@IsString()
	readonly monoBankApiKey!: string;
}
