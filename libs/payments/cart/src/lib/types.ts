/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Cart } from '../../../../shared/db/mysql/account/src';

export type SetupCart = Pick<
  Cart,
  | 'uid'
  | 'errorReasonId'
  | 'offeringConfigId'
  | 'experiment'
  | 'taxAddress'
  | 'couponCode'
  | 'stripeCustomerId'
  | 'email'
> & { interval?: string };
