import { IsPort, IsString, IsUrl } from 'class-validator';
import { MongooseModuleOptions } from '@nestjs/mongoose/dist/interfaces/mongoose-options.interface';

export class MongoConfig {
  @IsUrl()
  readonly url!: string;

  readonly options!: MongooseModuleOptions;
}

export class EnvironmentVariables {
  @IsPort()
  readonly port!: string;
  readonly mongo!: MongoConfig;

  @IsString()
  readonly monoBankApiKey!: string;
}
