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
  getTransformedResult(): CancelInterstitialOfferTransformed | undefined {
    const offers = this.rawResult?.cancelInterstitialOffers ?? [];

    if (offers.length > 1) {
      Sentry.captureMessage(
        'Unexpected number of cancel interstitial offers found for api identifier, intervals, and locale',
        { extra: { cancelInterstitialOffersCount: offers.length } }
      );
    }

    const cancelInterstitialOffer = offers.at(0);
    if (!cancelInterstitialOffer) return undefined;

    return {
      ...cancelInterstitialOffer,
      ctaMessage:
        cancelInterstitialOffer.localizations.at(0)?.ctaMessage ??
        cancelInterstitialOffer.ctaMessage,
      modalHeading1:
        cancelInterstitialOffer.localizations.at(0)?.modalHeading1 ??
        cancelInterstitialOffer.modalHeading1,
      modalHeading2:
        cancelInterstitialOffer.localizations.at(0)?.modalHeading2 ??
        cancelInterstitialOffer.modalHeading2,
      modalMessage: this.transformArrayStringField(
        cancelInterstitialOffer.localizations.at(0)?.modalMessage ??
          cancelInterstitialOffer.modalMessage
      ),
      productPageUrl: cancelInterstitialOffer.productPageUrl,
      upgradeButtonLabel:
        cancelInterstitialOffer.localizations.at(0)?.upgradeButtonLabel ??
        cancelInterstitialOffer.upgradeButtonLabel,
      upgradeButtonUrl: cancelInterstitialOffer.upgradeButtonUrl,
      offering: {
        ...cancelInterstitialOffer.offering,
        defaultPurchase: {
          purchaseDetails: {
            ...cancelInterstitialOffer.offering.defaultPurchase.purchaseDetails,
            webIcon:
              cancelInterstitialOffer.offering.defaultPurchase.purchaseDetails
                .webIcon,
          },
        },
      },
    };
  }

  get cancelInterstitialOffer(): CancelInterstitialOfferResult {
    return this.rawResult;
  }

  private transformArrayStringField(details: string): string[] {
    return details.split('\n').filter((detail) => !!detail);
  }
}
