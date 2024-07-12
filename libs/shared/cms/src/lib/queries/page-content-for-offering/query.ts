/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { graphql } from '../../../__generated__/gql';

export const pageContentForOfferingQuery = graphql(`
  query PageContentForOffering($locale: String!, $apiIdentifier: String!) {
    offerings(
      pagination: { start: 0, limit: 2 }
      filters: { apiIdentifier: { eq: $apiIdentifier } }
    ) {
      meta {
        pagination {
          total
        }
      }
      data {
        attributes {
          apiIdentifier
          stripeProductId
          defaultPurchase {
            data {
              attributes {
                purchaseDetails {
                  data {
                    attributes {
                      details
                      productName
                      subtitle
                      webIcon
                      localizations(filters: { locale: { eq: $locale } }) {
                        data {
                          attributes {
                            details
                            productName
                            subtitle
                            webIcon
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          commonContent {
            data {
              attributes {
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
                  data {
                    attributes {
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
            }
          }
        }
      }
    }
  }
`);
