/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { graphql } from '../../../__generated__/gql';

export const churnInterventionByProductIdQuery = graphql(`
  query ChurnInterventionByProductId(
    $offeringApiIdentifier: String
    $stripeProductId: String
    $interval: String!
    $locale: String!
    $churnType: String!
  ) {
    offerings(
      filters: {
        or: [
          { stripeProductId: { eq: $stripeProductId } }
          { apiIdentifier: { eq: $offeringApiIdentifier } }
        ]
      }
      pagination: { limit: 200 }
    ) {
      apiIdentifier
      defaultPurchase {
        purchaseDetails {
          productName
          webIcon
          localizations(filters: { locale: { eq: $locale } }) {
            productName
            webIcon
          }
        }
      }
      commonContent {
        successActionButtonUrl
        supportUrl
      }
      churnInterventions(
        filters: { interval: { eq: $interval }, churnType: { eq: $churnType } }
        pagination: { limit: 200 }
      ) {
        localizations(filters: { locale: { eq: $locale } }) {
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
