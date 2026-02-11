/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { graphql } from '../../../__generated__/gql';

export const pageContentForOfferingQuery = graphql(`
  query PageContentForOffering($locale: String!, $apiIdentifier: String!) {
    offerings(
      filters: { apiIdentifier: { eq: $apiIdentifier } }
      pagination: { limit: 200 }
    ) {
      apiIdentifier
      countries
      stripeProductId
      defaultPurchase {
        purchaseDetails {
          details
          productName
          subtitle
          webIcon
          localizations(filters: { locale: { eq: $locale } }) {
            details
            productName
            subtitle
            webIcon
          }
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
        localizations(filters: { locale: { eq: $locale } }) {
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
