/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { gql } from '@apollo/client';

export const GET_RELYING_PARTIES = gql`
  query getRelyingParties {
    relyingParties {
      id
      name
      imageUri
      redirectUri
      canGrant
      publicClient
      createdAt
      trusted
      allowedScopes
      notes
    }
  }
`;

export const UPDATE_NOTE = gql`
  mutation updateNotes($id: String!, $notes: String!) {
    updateNotes(id: $id, notes: $notes)
  }
`;
