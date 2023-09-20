/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { graphql } from '../../../__generated__/gql';

export const paginationTestMissingTotalQuery = graphql(`
  query PaginationTestMissingTotal($skip: Int!, $limit: Int!) {
    purchaseCollection(limit: 1, locale: "en-US") {
      items {
        sys {
          id
        }
        stripePlanChoices
        offering {
          capabilitiesCollection(skip: $skip, limit: $limit) {
            items {
              slug
            }
          }
        }
      }
    }
  }
`);
