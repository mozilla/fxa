/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { graphql } from '../../../__generated__/gql';

export const eligibilityContentByOfferingQuery = graphql(`
  query EligibilityContentByOffering($apiIdentifier: String!) {
    offerings(
      pagination: { start: 0, limit: 2 }
      filters: { apiIdentifier: { eq: $apiIdentifier } }
    ) {
      data {
        attributes {
          apiIdentifier
          stripeProductId
          defaultPurchase {
            data {
              attributes {
                stripePlanChoices {
                  stripePlanChoice
                }
              }
            }
          }
          subGroups {
            data {
              attributes {
                groupName
                offerings {
                  data {
                    attributes {
                      apiIdentifier
                      stripeProductId
                      defaultPurchase {
                        data {
                          attributes {
                            stripePlanChoices {
                              stripePlanChoice
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
  }
`);
