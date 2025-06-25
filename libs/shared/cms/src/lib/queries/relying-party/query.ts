/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { graphql } from '../../../__generated__/gql';

export const relyingPartyQuery = graphql(`
  query RelyingParties($clientId: String!, $entrypoint: String!) {
    relyingParties(
      filters:  {
        clientId:  {
          eq: $clientId
        }
        entrypoint:  {
          eq: $entrypoint
        }
      }
    ) {
      clientId
      entrypoint
      EmailFirstPage {
        headline
        description
        submitButtonColorHex
      }
    }
  }
`);
