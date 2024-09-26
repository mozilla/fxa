/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import Emittery from 'emittery';
import { FxaPaySetupViewMetrics, GleanEvents } from './glean.types';
import { ProductConfigurationManager } from '@fxa/shared/cms';
import { Injectable } from '@nestjs/common';
import { mapParams } from './utils/mapParams';
import { PaymentsGleanManager } from './glean.manager';
import { AccountManager } from '@fxa/shared/account/account';
import { SubplatInterval } from '@fxa/payments/customer';

@Injectable()
export class PaymentsGleanService {
  private emitter: Emittery<GleanEvents>;

  constructor(
    private productConfigurationManager: ProductConfigurationManager,
    private paymentsGleanManager: PaymentsGleanManager,
    private accountManager: AccountManager
  ) {
    this.emitter = new Emittery<GleanEvents>();
    this.emitter.on(
      'fxaPaySetupView',
      this.handleEventFxaPaySetupView.bind(this)
    );
  }

  getEmitter(): Emittery<GleanEvents> {
    return this.emitter;
  }

  async handleEventFxaPaySetupView(metricsData: FxaPaySetupViewMetrics) {
    const { offeringId, interval } = mapParams(metricsData.params);
    const [cmsData, optedOut] = await Promise.all([
      this.retrieveCMSData(offeringId, interval),
      this.retrieveOptOut(metricsData.uid),
    ]);

    if (!optedOut) {
      await this.paymentsGleanManager.recordFxaPaySetupView(
        metricsData,
        cmsData
      );
    }
  }

  private async retrieveCMSData(offeringId: string, interval: SubplatInterval) {
    try {
      const { id: priceId, product: productId } =
        await this.productConfigurationManager.retrieveStripePrice(
          offeringId,
          interval
        );
      return {
        priceId,
        productId,
      };
    } catch (error) {
      return {
        priceId: '',
        productId: '',
      };
    }
  }

  private async retrieveOptOut(uid?: string): Promise<boolean> {
    if (!uid) return false;
    const accounts = await this.accountManager.getAccounts([uid]);
    return accounts[0].metricsOptOutAt !== null;
  }
}
