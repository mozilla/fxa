/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { graphql } from '../../../__generated__/gql';

export const legalTermsQuery = graphql(`
  query LegalTerms($identifier: String!) {
    legalNotices(
      filters: { serviceOrClientId: { eq: $identifier } }
      pagination: { limit: 1 }
    ) {
      serviceOrClientId
      Terms {
        label
        termsOfServiceLink
        privacyNoticeLink
        fontSize
      }
      l10nId
    }
  }
`);
