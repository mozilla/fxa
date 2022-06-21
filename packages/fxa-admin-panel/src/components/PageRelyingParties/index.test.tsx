/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import PageRelyingParties, { GET_RELYING_PARTIES } from '.';
import { RelyingParty } from 'fxa-admin-server/src/graphql';

const mockGetRelyingParties = (
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

const MOCK_RP_ALL_FIELDS = {
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
} as RelyingParty;

const MOCK_RP_FALSY_FIELDS = {
  id: '38a6b9b3a65a1871',
  name: '123Done PKCE',
  redirectUri: 'http://localhost:8080/?oauth_pkce_redirect=1',
  canGrant: false,
  publicClient: false,
  createdAt: 1583259953,
  trusted: false,
  imageUri: '',
  allowedScopes: null,
} as RelyingParty;

it('renders without imploding and shows loading text', () => {
  render(
    <MockedProvider mocks={[mockGetRelyingParties()]} addTypename={false}>
      <PageRelyingParties />
    </MockedProvider>
  );
  const rpHeading = screen.getByRole('heading', { level: 2 });
  expect(rpHeading).toHaveTextContent('Relying Parties');
  screen.getByText('Loading...');
});

it('renders as expected with zero relying parties', async () => {
  render(
    <MockedProvider mocks={[mockGetRelyingParties()]} addTypename={false}>
      <PageRelyingParties />
    </MockedProvider>
  );
  await screen.findByText('No relying parties were found', { exact: false });
});

it('renders as expected with a relying party containing all fields', async () => {
  render(
    <MockedProvider
      mocks={[mockGetRelyingParties([MOCK_RP_ALL_FIELDS])]}
      addTypename={false}
    >
      <PageRelyingParties />
    </MockedProvider>
  );
  await screen.findByText(MOCK_RP_ALL_FIELDS.id);
  screen.getByText(MOCK_RP_ALL_FIELDS.id);
  screen.getByText(MOCK_RP_ALL_FIELDS.name);
  screen.getByText(MOCK_RP_ALL_FIELDS.redirectUri);
  screen.getByText(MOCK_RP_ALL_FIELDS.allowedScopes!);
  screen.getByText('1970', { exact: false });
  expect(screen.getAllByText('Yes')).toHaveLength(3);
});

it('renders as expected with a relying party containing falsy fields', async () => {
  render(
    <MockedProvider
      mocks={[mockGetRelyingParties([MOCK_RP_FALSY_FIELDS])]}
      addTypename={false}
    >
      <PageRelyingParties />
    </MockedProvider>
  );
  expect(await screen.findAllByText('No')).toHaveLength(3);
  screen.getByText('(empty string)');
  screen.getByText('NULL');
});
