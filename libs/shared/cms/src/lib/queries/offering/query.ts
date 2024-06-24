/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { graphql } from '../../../__generated__/gql';

export const offeringQuery = graphql(`
  query Offering($id: String!, $locale: String!) {
    offering(id: $id, locale: $locale) {
      stripeProductId
      countries
      defaultPurchase {
        purchaseDetails {
          productName
          details
          subtitle
          webIcon
        }
      }
    }
  }
`);
