/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { graphql } from '../../../__generated__/gql';

export const pageContentForOfferingQuery = graphql(`
  query PageContentForOffering($locale: String!, $apiIdentifier: String!) {
    offeringCollection(
      skip: 0
      limit: 2
      locale: $locale
      where: { apiIdentifier_contains: $apiIdentifier }
    ) {
      items {
        apiIdentifier
        stripeProductId
        defaultPurchase {
          purchaseDetails {
            details
            productName
            subtitle
            webIcon
          }
        }
        commonContent {
          privacyNoticeUrl
          privacyNoticeDownloadUrl
          termsOfServiceUrl
          termsOfServiceDownloadUrl
          cancellationUrl
          emailIcon
          successActionButtonUrl
          successActionButtonLabel
          newsletterLabelTextCode
          newsletterSlug
        }
      }
    }
  }
`);
