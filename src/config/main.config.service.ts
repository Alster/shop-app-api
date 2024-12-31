import { Injectable } from "@nestjs/common";
import { IsPort, IsString, IsUrl } from "class-validator";

import { validateAndApplyConfig } from "@/shop-shared-server/helpers/validateAndApplyConfig";

class MainConfig {
	@IsPort()
	PORT: string;

	@IsUrl({
		protocols: ["mongodb"],
		host_whitelist: ["localhost", "127.0.0.1", "unicorn-mongodb"],
	})
	MONGO_URL: string;

	@IsString()
	MONOBANK_API_KEY: string;
}

@Injectable()
export default class MainConfigService extends MainConfig {
	constructor() {
		super();
		validateAndApplyConfig(MainConfig, this);
	}
}
