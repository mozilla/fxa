/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  CancelInterstitialOfferResult,
  CancelInterstitialOfferTransformed,
} from './types';
import * as Sentry from '@sentry/node';

export class CancelInterstitialOfferUtil {
  constructor(private rawResult: CancelInterstitialOfferResult) {}
  getTransformedResult(): CancelInterstitialOfferTransformed {
    if (this.rawResult.cancelInterstitialOffers.length !== 1) {
      Sentry.captureMessage(
        'Unexpected number of cancel interstitial offers found for api identifier, intervals, and locale',
        {
          extra: {
            cancelInterstitialOffersCount:
              this.rawResult.cancelInterstitialOffers.length,
          },
        }
      );
    }
    const cancelInterstitialOffer = this.rawResult.cancelInterstitialOffers[0];

    return {
      ...cancelInterstitialOffer,
      modalMessage: this.transformArrayStringField(
        cancelInterstitialOffer.modalMessage
      ),
    };
  }

  get cancelInterstitialOffer(): CancelInterstitialOfferResult {
    return this.rawResult;
  }

  private transformArrayStringField(details: string): string[] {
    return details.split('\n').filter((detail) => !!detail);
  }
}
