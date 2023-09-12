/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { graphql } from '../../__generated__/gql';

export const capabilityServiceByPriceIdsQuery = graphql(`
  query CapabilityServiceByPriceIds(
    $skip: Int!
    $limit: Int!
    $priceIds: [String]!
  ) {
    purchaseCollection(
      skip: $skip
      limit: $limit
      where: { stripePlanChoices_contains_some: $priceIds }
    ) {
      items {
        stripePlanChoices
        linkedFrom {
          offeringCollection(skip: 0, limit: 1) {
            items {
              capabilitiesCollection(skip: $skip, limit: $limit) {
                items {
                  slug
                  servicesCollection(skip: 0, limit: 1) {
                    items {
                      oauthClientId
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
