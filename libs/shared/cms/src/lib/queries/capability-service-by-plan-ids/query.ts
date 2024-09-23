/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { graphql } from '../../../__generated__/gql';

export const capabilityServiceByPlanIdsQuery = graphql(`
  query CapabilityServiceByPlanIds(
    $skip: Int!
    $limit: Int!
    $stripePlanIds: [String]!
  ) {
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
      pagination: { start: $skip, limit: $limit }
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
                stripeLegacyPlans(pagination: { limit: 200 }) {
                  stripeLegacyPlan
                }
                capabilities {
                  data {
                    attributes {
                      slug
                      services {
                        data {
                          attributes {
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
      }
    }
  }
`);
