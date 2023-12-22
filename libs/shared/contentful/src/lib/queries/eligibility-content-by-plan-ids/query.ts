/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { graphql } from '../../../__generated__/gql';

export const eligibilityContentByPlanIdsQuery = graphql(`
  query EligibilityContentByPlanIds(
    $skip: Int!
    $limit: Int!
    $locale: String!
    $stripePlanIds: [String]!
  ) {
    purchaseCollection(
      skip: $skip
      limit: $limit
      locale: $locale
      where: {
        OR: [
          { stripePlanChoices_contains_some: $stripePlanIds }
          { offering: { stripeLegacyPlans_contains_some: $stripePlanIds } }
        ]
      }
    ) {
      total
      items {
        stripePlanChoices
        offering {
          stripeProductId
          stripeLegacyPlans
          countries
          linkedFrom {
            subGroupCollection(skip: 0, limit: 25) {
              items {
                groupName
                offeringCollection(skip: 0, limit: 20) {
                  items {
                    stripeProductId
                    stripeLegacyPlans
                    countries
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
