/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { gql } from '@apollo/client';

export interface LegalDoc {
  markdown: string;
}

export const GET_LEGAL_DOC = gql`
  query GetLegalDoc($input: LegalInput!) {
    getLegalDoc(input: $input) {
      markdown
    }
  }
`;
