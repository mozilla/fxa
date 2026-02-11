/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { graphql } from '../../../__generated__/gql';

export const eligibilityContentByOfferingQuery = graphql(`
  query EligibilityContentByOffering($apiIdentifier: String!) {
    offerings(
      filters: { apiIdentifier: { eq: $apiIdentifier } }
      pagination: { limit: 200 }
    ) {
      apiIdentifier
      stripeProductId
      defaultPurchase {
        stripePlanChoices {
          stripePlanChoice
        }
      }
      subGroups {
        groupName
        offerings {
          apiIdentifier
          stripeProductId
          defaultPurchase {
            stripePlanChoices {
              stripePlanChoice
            }
          }
        }
      }
    }
  }
`);
