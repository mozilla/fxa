/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { graphql } from '../../../__generated__/gql';

export const cancelInterstitialOfferQuery = graphql(`
  query CancelInterstitialOffer(
    $offeringApiIdentifier: String!
    $currentInterval: String!
    $upgradeInterval: String!
    $locale: String!
  ) {
    cancelInterstitialOffers(
      filters: {
        offeringApiIdentifier: { eq: $offeringApiIdentifier }
        currentInterval: { eq: $currentInterval }
        upgradeInterval: { eq: $upgradeInterval }
      }
    ) {
      offeringApiIdentifier
      currentInterval
      upgradeInterval
      advertisedSavings
      ctaMessage
      modalHeading1
      modalHeading2
      modalMessage
      productPageUrl
      upgradeButtonLabel
      upgradeButtonUrl
      localizations(filters: { locale: { eq: $locale } }) {
        ctaMessage
        modalHeading1
        modalHeading2
        modalMessage
        productPageUrl
        upgradeButtonLabel
        upgradeButtonUrl
      }
      offering {
        stripeProductId
        defaultPurchase {
          purchaseDetails {
            webIcon
            localizations(filters: { locale: { eq: $locale } }) {
              webIcon
            }
          }
        }
      }
    }
  }
`);
