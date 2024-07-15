/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { graphql } from '../../../__generated__/gql';

export const purchaseWithDetailsOfferingContentQuery = graphql(`
  query PurchaseWithDetailsOfferingContent(
    $skip: Int!
    $limit: Int!
    $locale: String!
    $stripePlanIds: [String]!
  ) {
    purchases(
      pagination: { start: $skip, limit: $limit }
      filters: {
        or: [
          { stripePlanChoices: { stripePlanChoice: { in: $stripePlanIds } } }
          {
            offering: {
              stripeLegacyPlans: { stripeLegacyPlan: { in: $stripePlanIds } }
            }
          }
        ]
      }
    ) {
      data {
        attributes {
          stripePlanChoices {
            stripePlanChoice
          }
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
          offering {
            data {
              attributes {
                stripeProductId
                stripeLegacyPlans {
                  stripeLegacyPlan
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
      }
    }
  }
`);
