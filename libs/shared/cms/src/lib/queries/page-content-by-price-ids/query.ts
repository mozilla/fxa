/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { graphql } from '../../../__generated__/gql';

export const pageContentByPriceIdsQuery = graphql(`
  query pageContentByPriceIds($locale: String!, $stripePlanIds: [String]!) {
    purchases(
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
      pagination: { limit: 50 }
    ) {
      offering {
        stripeLegacyPlans(pagination: { limit: 100 }) {
          stripeLegacyPlan
        }
        commonContent {
          emailIcon
          supportUrl
          localizations(filters: { locale: { eq: $locale } }) {
            emailIcon
            supportUrl
          }
        }
        apiIdentifier
      }
      purchaseDetails {
        productName
        webIcon
        localizations(filters: { locale: { eq: $locale } }) {
          productName
          webIcon
        }
      }
      stripePlanChoices {
        stripePlanChoice
      }
    }
  }
`);
