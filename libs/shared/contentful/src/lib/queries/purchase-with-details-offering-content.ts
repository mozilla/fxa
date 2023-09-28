/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { graphql } from '../../__generated__/gql';

export const purchaseWithDetailsOfferingContentQuery = graphql(`
  query PurchaseWithDetailsOfferingContent(
    $skip: Int!
    $limit: Int!
    $locale: String!
    $stripePlanIds: [String]!
  ) {
    purchaseCollection(
      skip: $skip
      limit: $limit
      locale: $locale
      where: { stripePlanChoices_contains_some: $stripePlanIds }
    ) {
      items {
        stripePlanChoices
        purchaseDetails {
          details
          productName
          subtitle
          webIcon
        }
        offering {
          stripeProductId
          commonContent {
            privacyNoticeUrl
            privacyNoticeDownloadUrl
            termsOfServiceUrl
            termsOfServiceDownloadUrl
            cancellationUrl
            emailIcon
            successActionButtonUrl
            successActionButtonLabel
          }
        }
      }
    }
  }
`);
