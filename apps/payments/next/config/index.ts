import 'reflect-metadata';
import { Type } from 'class-transformer';
import { IsString, ValidateNested, IsDefined } from 'class-validator';
import {
  RootConfig as NestAppRootConfig,
  validate,
} from '@fxa/payments/ui/server';

class AuthJSConfig {
  @IsString()
  issuerUrl!: string;

  @IsString()
  wellKnownUrl!: string;

  @IsString()
  clientId!: string;
}

export class PaymentsNextConfig extends NestAppRootConfig {
  @Type(() => AuthJSConfig)
  @ValidateNested()
  @IsDefined()
  auth!: AuthJSConfig;

  @IsString()
  authSecret!: string;
}

export const config = validate(process.env, PaymentsNextConfig);
