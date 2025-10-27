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

export const CREATE_RELYING_PARTY = gql`
  mutation createRelyingParty($relyingParty: RelyingPartyUpdateDto!) {
    createRelyingParty(relyingParty: $relyingParty)
  }
`;

export const UPDATE_RELYING_PARTY = gql`
  mutation updateRelyingParty($id: String!, $relyingParty: RelyingPartyUpdateDto!) {
    updateRelyingParty(id: $id, relyingParty: $relyingParty)
  }
`;

export const DELETE_RELYING_PARTY = gql`
  mutation deleteRelyingParty($id: String!) {
    deleteRelyingParty(id: $id)
  }
`;
