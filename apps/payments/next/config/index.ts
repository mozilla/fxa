/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'reflect-metadata';
import 'server-only';
import { Type } from 'class-transformer';
import {
  IsString,
  ValidateNested,
  IsDefined,
  IsUrl,
  IsNumber,
  IsOptional,
  IsBoolean,
} from 'class-validator';
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

class SentryServerConfig {
  @IsOptional()
  @IsString()
  dsn?: string;

  @IsString()
  env!: string;

  @IsString()
  serverName!: string;

  @IsString()
  clientName!: string;

  @IsNumber()
  sampleRate!: number;

  @IsNumber()
  tracesSampleRate!: number;

  @IsOptional()
  @IsString()
  authToken?: string;
}

class AuthJSConfig {
  @IsUrl({ require_tld: false })
  issuerUrl!: string;

  @IsUrl({ require_tld: false })
  wellKnownUrl!: string;

  @IsUrl({ require_tld: false })
  tokenUrl!: string;

  @IsUrl({ require_tld: false })
  userinfoUrl!: string;

  @IsString()
  clientId!: string;

  @IsString()
  clientSecret!: string;
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

  @Type(() => SentryServerConfig)
  @ValidateNested()
  @IsDefined()
  sentry!: SentryServerConfig;

  @IsString()
  authSecret!: string;

  @IsBoolean()
  authTrustHost!: boolean;

  @IsString()
  stripePublicApiKey!: string;

  @IsUrl({ require_tld: false })
  contentServerUrl!: string;

  @IsUrl({ require_tld: false })
  paymentsNextHostedUrl!: string;

  @IsString()
  subscriptionsUnsupportedLocations!: string;

  /**
   * Nextjs Public Environment Variables
   */
  /*
   *  Should not make use of NEXT_PUBLIC_* environment variables
   *  since these are currently set during build time and the current
   *  build process is not setup to handle different variables
   *  for different environments at build time.
   *
   *  For config variables required on the client, consider making use
   *  of the ConfigProvider component, and see the Client Sentry init
   *  as an example.
   */
}

export const config = validate(
  {
    ...process.env,
    GLEAN_CONFIG__VERSION: process.env['GLEAN_CONFIG__VERSION'],
  },
  PaymentsNextConfig
);
