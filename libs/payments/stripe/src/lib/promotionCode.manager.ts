/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';

import { StripeClient } from './stripe.client';

@Injectable()
export class PromotionCodeManager {
  constructor(private client: StripeClient) {}

  async retrieve(id: string) {
    return this.client.promotionCodesRetrieve(id);
  }

  async retrieveByName(code: string, active?: boolean) {
    const promotionCodes = await this.client.promotionCodesList({
      active,
      code,
    });

    return promotionCodes.data.at(0);
  }
}
