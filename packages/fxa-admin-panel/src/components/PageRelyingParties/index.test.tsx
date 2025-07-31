/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import PageRelyingParties from '.';
import {
  mockGetRelyingParties,
  mockUpdateNotes,
  mockUpdateNotesError,
  MOCK_RP_ALL_FIELDS,
  MOCK_RP_FALSY_FIELDS,
} from './mocks';
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

it('updates notes', async () => {
  renderWithLocalizationProvider(
    <MockedProvider
      mocks={[
        mockGetRelyingParties([MOCK_RP_ALL_FIELDS]),
        mockUpdateNotes(MOCK_RP_ALL_FIELDS.id, 'test123'),
      ]}
      addTypename={false}
    >
      <PageRelyingParties />
    </MockedProvider>
  );

  await screen.findByText(MOCK_RP_ALL_FIELDS.id);
  fireEvent.change(screen.getByTestId(`notes-${MOCK_RP_ALL_FIELDS.id}`), {
    target: { value: 'test123' },
  });
  fireEvent.click(
    screen.getByTestId(`notes-save-btn-${MOCK_RP_ALL_FIELDS.id}`)
  );
  await waitFor(() => {
    screen.getByText('Updating...');
  });
  await waitFor(() => {
    screen.getByText('Save');
  });
});

it('shows error if notes fail to update', async () => {
  renderWithLocalizationProvider(
    <MockedProvider
      mocks={[
        mockGetRelyingParties([MOCK_RP_ALL_FIELDS]),
        mockUpdateNotesError(MOCK_RP_ALL_FIELDS.id, 'FAKE_OVERFLOW'),
      ]}
      addTypename={false}
    >
      <PageRelyingParties />
    </MockedProvider>
  );

  await screen.findByText(MOCK_RP_ALL_FIELDS.id);
  fireEvent.change(screen.getByTestId(`notes-${MOCK_RP_ALL_FIELDS.id}`), {
    target: { value: 'FAKE_OVERFLOW' },
  });
  fireEvent.click(
    screen.getByTestId(`notes-save-btn-${MOCK_RP_ALL_FIELDS.id}`)
  );
  await waitFor(() => {
    screen.getByText('Updating...');
  });
  await waitFor(() => {
    screen.getByText('Error: Changes not saved. Notes too long!');
  });
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
