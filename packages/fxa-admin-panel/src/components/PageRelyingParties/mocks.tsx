/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { MockedResponse } from '@apollo/client/testing';
import { RelyingParty } from 'fxa-admin-server/src/graphql';
import { GET_RELYING_PARTIES, UPDATE_NOTE } from './index.gql';
import { GraphQLError } from 'graphql';

// Response mocks
export const MOCK_RP_ALL_FIELDS = {
  id: 'fced6b5e3f4c66b9',
  name: 'Firefox Send local-dev',
  redirectUri: 'http://localhost:1337/oauth',
  canGrant: true,
  publicClient: true,
  createdAt: 1583259953,
  trusted: true,
  imageUri:
    'https://mozorg.cdn.mozilla.net/media/img/firefox/new/header-firefox.png',
  allowedScopes: 'https://identity.mozilla.com/apps/send',
  notes: null,
} as RelyingParty;

export const MOCK_RP_FALSY_FIELDS = {
  id: '38a6b9b3a65a1871',
  name: '123Done PKCE',
  redirectUri: 'http://localhost:8080/?oauth_pkce_redirect=1',
  canGrant: false,
  publicClient: false,
  createdAt: 1583259953,
  trusted: false,
  imageUri: '',
  allowedScopes: null,
  notes: null,
} as RelyingParty;

// Apollo mocks
export const mockGetRelyingParties = (
  relyingParties: RelyingParty[] = []
): MockedResponse => ({
  request: {
    query: GET_RELYING_PARTIES,
  },
  result: {
    data: {
      relyingParties,
    },
  },
});

export const mockUpdateNotes = (id: string, notes: string): MockedResponse => ({
  request: {
    query: UPDATE_NOTE,
    variables: { id, notes },
  },
  result: {
    data: {
      updateNotes: true,
    },
  },
});

export const mockUpdateNotesError = (
  id: string,
  notes: string
): MockedResponse => ({
  request: {
    query: UPDATE_NOTE,
    variables: { id, notes },
  },
  result: () => {
    return {
      errors: [new GraphQLError('... ER_DATA_TOO_LONG ...')],
    };
  },
});
