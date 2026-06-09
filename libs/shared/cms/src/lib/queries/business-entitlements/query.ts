/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { graphql } from '../../../__generated__/gql';

/**
 * Fetches all `business-entitlement` entries with their matchers and
 * capabilities. Auth-server filters in memory against the user's email.
 */
export const businessEntitlementsQuery = graphql(`
  query BusinessEntitlements {
    businessEntitlements(pagination: { limit: 200 }) {
      documentId
      internalName
      capabilities {
        slug
        services {
          oauthClientId
        }
      }
      matchers {
        __typename
        ... on ComponentMatchersEmailList {
          emails
        }
      }
    }
  }
`);
