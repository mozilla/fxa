/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseError } from '@fxa/shared/error';

class UpgradeCartError extends BaseError {
  constructor(message: string, info: Record<string, any>) {
    super(message, { info });
    this.name = 'UpgradeCartError';
  }
}

export class UpgradeCartFromOfferingConfigIdMissingError extends UpgradeCartError {
  constructor(cartId: string) {
    super(`fromOfferingConfigId not present for upgrade cart: ${cartId}`, {
      cartId,
    });
    this.name = 'UpgradeCartFromOfferingConfigIdMissingError';
  }
}

export class UpgradeCartFromPriceMissingError extends UpgradeCartError {
  constructor(cartId: string) {
    super(`fromPrice not present for upgrade cart: ${cartId}`, { cartId });
    this.name = 'UpgradeCartFromPriceMissingError';
  }
}
