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
  @IsString()
  serverName!: string;

  @IsString()
  authToken!: string;
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

  @Type(() => SentryServerConfig)
  @ValidateNested()
  @IsDefined()
  sentry!: SentryServerConfig;

  @IsString()
  authSecret!: string;

  @IsString()
  stripePublicApiKey!: string;

  @IsUrl({ require_tld: false })
  contentServerUrl!: string;

  /**
   * Nextjs Public Environment Variables
   */

  /**
   * Sentry Config
   */
  @IsOptional()
  @IsString()
  nextPublicSentryDsn?: string;

  @IsString()
  nextPublicSentryEnv!: string;

  @IsString()
  nextPublicSentryClientName!: string;

  @IsNumber()
  nextPublicSentrySampleRate!: number;

  @IsNumber()
  nextPublicSentryTracesSampleRate!: number;
}

export const config = validate(
  {
    ...process.env,
    GLEAN_CONFIG__VERSION: process.env['GLEAN_CONFIG__VERSION'],
  },
  PaymentsNextConfig
);
