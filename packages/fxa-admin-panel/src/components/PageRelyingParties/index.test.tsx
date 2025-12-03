/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { act, fireEvent, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import PageRelyingParties from '.';
import {
  mockGetRelyingParties,
  MOCK_RP_ALL_FIELDS,
  MOCK_RP_FALSY_FIELDS,
} from './mocks';
import {
  CREATE_RELYING_PARTY,
  UPDATE_RELYING_PARTY,
  DELETE_RELYING_PARTY,
} from './index.gql';
import { IClientConfig } from '../../../interfaces';
import { GuardEnv, AdminPanelGroup, AdminPanelGuard } from '@fxa/shared/guards';
import { mockConfigBuilder } from '../../lib/config';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';

// Setup the current user hook. Required for Guards.
const mockGuard = new AdminPanelGuard(GuardEnv.Prod);

const mockConfig: IClientConfig = mockConfigBuilder({
  user: {
    email: 'test@mozilla.com',
    group: mockGuard.getGroup(AdminPanelGroup.AdminProd),
  },
});

jest.mock('../../hooks/UserContext.ts', () => ({
  useUserContext: () => {
    const ctx = {
      guard: mockGuard,
      user: mockConfig.user,
      setUser: () => {},
    };
    return ctx;
  },
}));

it('renders without imploding and shows loading text', () => {
  renderWithLocalizationProvider(
    <MockedProvider mocks={[mockGetRelyingParties()]} addTypename={false}>
      <PageRelyingParties />
    </MockedProvider>
  );
  const rpHeading = screen.getByRole('heading', { level: 2 });
  expect(rpHeading).toHaveTextContent('Relying Parties');
  screen.getByText('Loading...');
});

it('renders as expected with zero relying parties', async () => {
  renderWithLocalizationProvider(
    <MockedProvider mocks={[mockGetRelyingParties()]} addTypename={false}>
      <PageRelyingParties />
    </MockedProvider>
  );
  await screen.findByText('No relying parties were found', { exact: false });
});

it('renders as expected with a relying party containing all fields', async () => {
  renderWithLocalizationProvider(
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
  expect(screen.getAllByText('true')).toHaveLength(3);
});

it('creates a new relying party via UI', async () => {
  jest.useFakeTimers();
  const mocks = [
    mockGetRelyingParties([]),
    {
      request: {
        query: CREATE_RELYING_PARTY,
        variables: {
          relyingParty: {
            name: 'New RP',
            imageUri: 'http://mozilla.com/rp/logo.png',
            redirectUri: 'http://mozilla.com/rp/login',
            canGrant: false,
            publicClient: false,
            trusted: false,
            allowedScopes: 'profile email',
            notes: 'Brand new',
          },
        },
      },
      result: { data: { createRelyingParty: 'new-id' } },
    },
    // refetch after success
    mockGetRelyingParties([]),
  ];

  const { container } = renderWithLocalizationProvider(
    <MockedProvider mocks={mocks} addTypename={false}>
      <PageRelyingParties />
    </MockedProvider>
  );
  fireEvent.click(screen.getByText('Create!'));
  fireEvent.change(screen.getByPlaceholderText('name'), {
    target: { value: 'New RP' },
  });
  fireEvent.change(
    screen.getByPlaceholderText('http://mozilla.com/rp/logo.png'),
    { target: { value: 'http://mozilla.com/rp/logo.png' } }
  );
  fireEvent.change(screen.getByPlaceholderText('http://mozilla.com/rp/login'), {
    target: { value: 'http://mozilla.com/rp/login' },
  });

  const canGrant = container.querySelector(
    'select[name="canGrant"]'
  ) as HTMLSelectElement;
  const publicClient = container.querySelector(
    'select[name="publicClient"]'
  ) as HTMLSelectElement;
  const trusted = container.querySelector(
    'select[name="trusted"]'
  ) as HTMLSelectElement;
  fireEvent.change(canGrant, { target: { value: 'false' } });
  fireEvent.change(publicClient, { target: { value: 'false' } });
  fireEvent.change(trusted, { target: { value: 'false' } });

  fireEvent.change(screen.getByPlaceholderText('profile'), {
    target: { value: 'profile email' },
  });
  fireEvent.change(screen.getByPlaceholderText('Enter notes about RP.'), {
    target: { value: 'Brand new' },
  });

  // Submit
  fireEvent.click(screen.getByTestId('rp-update'));

  // Status transitions
  await screen.findByText('Pending');
  await screen.findByText('Success!');

  // Back to the collapsed Add section
  await screen.findByText(
    'To finalize this new RP, a couple more steps are needed'
  );
  fireEvent.click(screen.getByText('Got it!'));

  await screen.findByText('Create!');

  jest.useRealTimers();
});

it('updates an existing relying party via UI', async () => {
  jest.useFakeTimers();
  const rp = { ...MOCK_RP_ALL_FIELDS };
  const mocks = [
    mockGetRelyingParties([rp]),
    {
      request: {
        query: UPDATE_RELYING_PARTY,
        variables: {
          id: rp.id,
          relyingParty: {
            name: rp.name,
            imageUri: rp.imageUri,
            redirectUri: rp.redirectUri,
            canGrant: rp.canGrant,
            publicClient: rp.publicClient,
            trusted: rp.trusted,
            allowedScopes: rp.allowedScopes,
            notes: 'updated-notes',
          },
        },
      },
      result: { data: { updateRelyingParty: true } },
    },
    // refetch after success
    mockGetRelyingParties([rp]),
  ];

  renderWithLocalizationProvider(
    <MockedProvider mocks={mocks} addTypename={false}>
      <PageRelyingParties />
    </MockedProvider>
  );

  await screen.findByText(rp.name);
  fireEvent.click(screen.getByText('🖊️ Edit'));
  // Change notes only
  fireEvent.change(screen.getByPlaceholderText('Enter notes about RP.'), {
    target: { value: 'updated-notes' },
  });
  fireEvent.click(screen.getByTestId('rp-update'));

  await screen.findByText('pending');
  await screen.findByText('Success!');
  await act(async () => {
    jest.advanceTimersByTime(600);
  });
  // Back to view mode
  await screen.findByText(rp.name);
  jest.useRealTimers();
});

it('deletes an existing relying party via UI', async () => {
  jest.useFakeTimers();
  const rp = { ...MOCK_RP_ALL_FIELDS };
  const mocks = [
    mockGetRelyingParties([rp]),
    {
      request: {
        query: DELETE_RELYING_PARTY,
        variables: { id: rp.id },
      },
      result: { data: { deleteRelyingParty: true } },
    },
    // refetch after success
    mockGetRelyingParties([rp]),
  ];

  renderWithLocalizationProvider(
    <MockedProvider mocks={mocks} addTypename={false}>
      <PageRelyingParties />
    </MockedProvider>
  );

  await screen.findByText(rp.name);
  fireEvent.click(screen.getByText('🗑️ Delete'));

  fireEvent.change(screen.getByPlaceholderText('Enter Relying Party Name'), {
    target: { value: rp.name },
  });
  fireEvent.click(screen.getByTestId('rp-delete'));

  await screen.findByText('Success!');
  await act(async () => {
    jest.advanceTimersByTime(600);
  });
  await screen.findByText(rp.name);
  jest.useRealTimers();
});

it('filters relying parties by name and id', async () => {
  const rp1 = { ...MOCK_RP_ALL_FIELDS };
  const rp2 = { ...MOCK_RP_FALSY_FIELDS };
  renderWithLocalizationProvider(
    <MockedProvider
      mocks={[mockGetRelyingParties([rp1, rp2])]}
      addTypename={false}
    >
      <PageRelyingParties />
    </MockedProvider>
  );

  // Both are visible initially
  await screen.findByText(rp1.name);
  await screen.findByText(rp2.name);

  // Filter by name substring (case-sensitive includes)
  fireEvent.change(
    screen.getByPlaceholderText('Filter by relying party name or ID.'),
    { target: { value: 'Send' } }
  );
  fireEvent.click(screen.getByTestId('rp-filter'));

  // rp1 matches, rp2 should be filtered out
  await screen.findByText(rp1.name);
  expect(screen.queryByText(rp2.name)).toBeNull();

  // Filter by id substring
  fireEvent.change(
    screen.getByPlaceholderText('Filter by relying party name or ID.'),
    { target: { value: rp2.id.slice(0, 6) } }
  );
  fireEvent.click(screen.getByTestId('rp-filter'));

  await screen.findByText(rp2.name);
  expect(screen.queryByText(rp1.name)).toBeNull();
});

it('renders as expected with a relying party containing falsy fields', async () => {
  renderWithLocalizationProvider(
    <MockedProvider
      mocks={[mockGetRelyingParties([MOCK_RP_FALSY_FIELDS])]}
      addTypename={false}
    >
      <PageRelyingParties />
    </MockedProvider>
  );
  expect(await screen.findAllByText('false')).toHaveLength(3);
  screen.getByText('(empty string)');
  screen.getByText('NULL');
});
