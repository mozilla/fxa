/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Provider } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsString, ValidateNested } from 'class-validator';

export class PaypalRetryConfig {
  @IsNumber()
  public readonly retries!: number;

  @IsNumber()
  public readonly minTimeout!: number;

  @IsNumber()
  public readonly factor!: number;
}

export class PaypalClientConfig {
  @IsBoolean()
  public readonly sandbox!: boolean;

  @IsString()
  public readonly user!: string;

  @IsString()
  public readonly pwd!: string;

  @IsString()
  public readonly signature!: string;

  @Type(() => PaypalRetryConfig)
  @ValidateNested()
  public readonly retryOptions?: PaypalRetryConfig;
}

export const MockPaypalClientConfig = {
  user: 'user',
  sandbox: true,
  pwd: 'pwd',
  signature: 'sig',
} satisfies PaypalClientConfig;

export const MockPaypalClientConfigProvider = {
  provide: PaypalClientConfig,
  useValue: MockPaypalClientConfig,
} satisfies Provider<PaypalClientConfig>;
