/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { graphql } from '../../../__generated__/gql';

export const eligibilityContentByPlanIdsQuery = graphql(`
  query EligibilityContentByPlanIds($stripePlanIds: [String]!) {
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
      pagination: { limit: 200 }
    ) {
      stripePlanChoices {
        stripePlanChoice
      }
      offering {
        apiIdentifier
        stripeProductId
        stripeLegacyPlans(pagination: { limit: 200 }) {
          stripeLegacyPlan
        }
        countries
        subGroups {
          groupName
          offerings {
            apiIdentifier
            stripeProductId
            stripeLegacyPlans(pagination: { limit: 200 }) {
              stripeLegacyPlan
            }
            countries
          }
        }
      }
    }
  }
`);
