import 'reflect-metadata';
import 'server-only';
import { Type } from 'class-transformer';
import { IsString, ValidateNested, IsDefined, IsUrl } from 'class-validator';
import {
  RootConfig as NestAppRootConfig,
  validate,
} from '@fxa/payments/ui/server';

class CspConfig {
  @IsUrl()
  accountsStaticCdn!: string;

  @IsUrl()
  paypalApi!: string;
}

class PaypalConfig {
  @IsString()
  clientId!: string;
}

class AuthJSConfig {
  @IsUrl({ require_tld: false })
  issuerUrl!: string;

  @IsUrl({ require_tld: false })
  wellKnownUrl!: string;

  @IsString()
  clientId!: string;
}

export class PaymentsNextConfig extends NestAppRootConfig {
  @Type(() => AuthJSConfig)
  @ValidateNested()
  @IsDefined()
  auth!: AuthJSConfig;

  @Type(() => PaypalConfig)
  @ValidateNested()
  @IsDefined()
  paypal!: PaypalConfig;

  @Type(() => CspConfig)
  @ValidateNested()
  @IsDefined()
  csp!: CspConfig;

  @IsString()
  authSecret!: string;

  @IsString()
  stripePublicApiKey!: string;

  @IsUrl({ require_tld: false })
  contentServerUrl!: string;
}

export const config = validate(process.env, PaymentsNextConfig);
