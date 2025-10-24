/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { graphql } from '../../../__generated__/gql';

export const iapOfferingsByStoreIDsQuery = graphql(`
  query IapOfferingsByStoreIDs($locale: String!, $storeIDs: [String!]!) {
    iaps(filters: { storeID: { in: $storeIDs } }) {
      storeID
      interval
      offering {
        apiIdentifier
        commonContent {
          supportUrl
          localizations(filters: { locale: { eq: $locale } }) {
            supportUrl
          }
        }
        defaultPurchase {
          stripePlanChoices {
            stripePlanChoice
          }
          purchaseDetails {
            productName
            webIcon
            localizations(filters: { locale: { eq: $locale } }) {
              productName
              webIcon
            }
          }
        }
        subGroups {
          groupName
          offerings {
            apiIdentifier
          }
        }
      }
    }
  }
`);
