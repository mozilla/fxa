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
  mutation create($relyingParty: RelyingPartyUpdateDto!) {
    create(relyingParty: $relyingParty)
  }
`;

export const UPDATE_RELYING_PARTY = gql`
  mutation update($id: String!, $relyingParty: RelyingPartyUpdateDto!) {
    update(id: $id, relyingParty: $relyingParty)
  }
`;

export const DELETE_RELYING_PARTY = gql`
  mutation delete($id: String!) {
    delete(id: $id)
  }
`;
