/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsOptional, ValidateNested } from 'class-validator';
import { PaymentsEmitterEventsKeys } from '@fxa/payments/events';
import type { PaymentsEmitterEventsKeysType } from '@fxa/payments/events';
import { PaymentProvidersTypePartial } from '@fxa/payments/metrics';
import type { PaymentProvidersType } from '@fxa/payments/customer';
import { RequestArgs } from './common/RequestArgs';

export class RecordEmitterEventArgs {
  @IsEnum(PaymentsEmitterEventsKeys)
  eventName!: PaymentsEmitterEventsKeysType;

  @Type(() => RequestArgs)
  @ValidateNested()
  requestArgs!: RequestArgs;

  @IsOptional()
  @IsIn([...PaymentProvidersTypePartial])
  paymentProvider?: PaymentProvidersType;
}
