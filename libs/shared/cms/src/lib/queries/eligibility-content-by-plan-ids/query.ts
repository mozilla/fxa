/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { graphql } from '../../../__generated__/gql';

export const eligibilityContentByPlanIdsQuery = graphql(`
  query EligibilityContentByPlanIds(
    $skip: Int!
    $limit: Int!
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
      meta {
        pagination {
          total
        }
      }
      data {
        attributes {
          stripePlanChoices {
            stripePlanChoice
          }
          offering {
            data {
              attributes {
                stripeProductId
                stripeLegacyPlans {
                  stripeLegacyPlan
                }
                countries
                subGroups {
                  data {
                    attributes {
                      groupName
                      offerings {
                        data {
                          attributes {
                            stripeProductId
                            stripeLegacyPlans {
                              stripeLegacyPlan
                            }
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
        }
      }
    }
  }
`);
