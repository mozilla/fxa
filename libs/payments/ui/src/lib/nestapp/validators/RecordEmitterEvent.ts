/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Type } from 'class-transformer';
import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PaymentsEmitterEventsKeys } from '@fxa/payments/events';
import type { PaymentsEmitterEventsKeysType } from '@fxa/payments/events';
import {
  PaymentProvidersTypePartial,
  type PaymentProvidersType,
} from '@fxa/payments/metrics';

/**
 * Common metrics that can be found on all events
 */
class RequestArgs {
  @IsString()
  ipAddress!: string;

  @IsString()
  deviceType!: string;

  @IsString()
  userAgent!: string;

  @IsObject()
  params!: Record<string, string>;

  @IsObject()
  searchParams!: Record<string, string>;
}

export class RecordEmitterEventArgs {
  @IsEnum(PaymentsEmitterEventsKeys)
  eventName!: PaymentsEmitterEventsKeysType;

  @Type(() => RequestArgs)
  @ValidateNested()
  requestArgs!: RequestArgs;

  @IsOptional()
  @IsEnum(PaymentProvidersTypePartial)
  paymentProvider?: PaymentProvidersType;
}
