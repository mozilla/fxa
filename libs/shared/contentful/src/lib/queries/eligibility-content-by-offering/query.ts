/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { graphql } from '../../../__generated__/gql';

export const eligibilityContentByOfferingQuery = graphql(`
  query EligibilityContentByOffering($offering: String!) {
    offeringCollection(
      skip: 0
      limit: 2
      where: { apiIdentifier_contains: $offering }
    ) {
      items {
        apiIdentifier
        stripeProductId
        defaultPurchase {
          stripePlanChoices
        }
        linkedFrom {
          subGroupCollection(skip: 0, limit: 25) {
            items {
              groupName
              offeringCollection(skip: 0, limit: 20) {
                items {
                  apiIdentifier
                  stripeProductId
                  defaultPurchase {
                    stripePlanChoices
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
