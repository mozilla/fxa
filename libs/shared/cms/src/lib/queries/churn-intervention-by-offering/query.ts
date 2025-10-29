/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { graphql } from '../../../__generated__/gql';

export const churnInterventionByOfferingQuery = graphql(`
  query ChurnInterventionByOffering($stripeProductId: String!, $interval: String!, $locale: String!) {
    offerings(
      filters: { stripeProductId: { eq: $stripeProductId } }
      pagination: { limit: 200 }
    ) {
      defaultPurchase {
        purchaseDetails {
          webIcon
          localizations(filters: { locale: { eq: $locale } }) {
            webIcon
          }
        }
      }
      commonContent {
        supportUrl
      }
      churnInterventions(
        filters: { interval: { eq: $interval } }
        pagination: { limit: 200 }
      ) {
        churnInterventionId
        churnType
        redemptionLimit
        stripeCouponId
        interval
        discountAmount
        ctaMessage
        modalHeading
        modalMessage
        productPageUrl
        termsHeading
        termsDetails
      }
    }
  }
`);
