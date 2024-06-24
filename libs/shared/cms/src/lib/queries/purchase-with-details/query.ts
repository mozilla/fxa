/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { graphql } from '../../../__generated__/gql';

export const purchaseWithDetailsQuery = graphql(`
  query PurchaseWithDetails($id: String!, $locale: String!) {
    purchase(id: $id, locale: $locale) {
      internalName
      description
      purchaseDetails {
        productName
        details
        webIcon
      }
    }
  }
`);
