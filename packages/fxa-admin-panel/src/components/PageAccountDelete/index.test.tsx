/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { PageAccountDelete } from '.';
import { IClientConfig } from '../../../interfaces';
import {
  AdminPanelEnv,
  AdminPanelGroup,
  AdminPanelGuard,
} from '../../../../fxa-shared/guards';
import { mockConfigBuilder } from '../../lib/config';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import {
  mockGqlAccountDeleteMutation,
  mockGqlAccountDeleteTaskStatusQuery,
} from './mocks';

// Setup the current user hook. Required for Guards.
const mockGuard = new AdminPanelGuard(AdminPanelEnv.Prod);
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

it('renders without imploding', () => {
  renderWithLocalizationProvider(
    <MockedProvider mocks={[]} addTypename={false}>
      <PageAccountDelete />
    </MockedProvider>
  );

  expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
    'Delete Accounts'
  );
});

it('deletes accounts', async () => {
  renderWithLocalizationProvider(
    <MockedProvider
      mocks={[
        mockGqlAccountDeleteMutation(),
        mockGqlAccountDeleteTaskStatusQuery(),
      ]}
    >
      <PageAccountDelete />
    </MockedProvider>
  );

  expect(
    fireEvent.change(screen.getByTestId(`account-list-input`), {
      target: {
        value: 'foo@mozilla.com,bar@mozilla.com',
      },
    })
  ).toBeTruthy();

  expect(
    fireEvent.click(screen.getByTestId(`account-delete-btn`))
  ).toBeTruthy();

  await waitFor(() => {
    screen.getByText('Pending');
    screen.getByText('Task completed.');
  });
});
