/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use server';

import { getApp } from '../nestapp/app';
import { flattenRouteParams } from '../utils/flatParam';
import { getAdditionalRequestArgs } from '../utils/getAdditionalRequestArgs';
import { PaymentProvidersType } from '@fxa/payments/cart';
import { PaymentsEmitterEventsKeysType } from '@fxa/payments/events';

async function recordEmitterEventAction(
  eventName: PaymentsEmitterEventsKeysType,
  params: Record<string, string | string[]>,
  searchParams: Record<string, string | string[]>
): Promise<void>;

async function recordEmitterEventAction(
  eventName: 'checkoutFail',
  params: Record<string, string | string[]>,
  searchParams: Record<string, string | string[]>,
  paymentProvider?: PaymentProvidersType
): Promise<void>;

async function recordEmitterEventAction(
  eventName: 'checkoutSubmit' | 'checkoutSuccess',
  params: Record<string, string | string[]>,
  searchParams: Record<string, string | string[]>,
  paymentProvider: PaymentProvidersType
): Promise<void>;

async function recordEmitterEventAction(
  eventName: PaymentsEmitterEventsKeysType,
  params: Record<string, string | string[]>,
  searchParams: Record<string, string | string[]>,
  paymentProvider?: PaymentProvidersType
) {
  const requestArgs = {
    ...getAdditionalRequestArgs(),
    params: flattenRouteParams(params),
    searchParams: flattenRouteParams(searchParams),
  };

  return getApp().getActionsService().recordEmitterEvent({
    eventName,
    requestArgs,
    paymentProvider,
  });
}

export { recordEmitterEventAction };
