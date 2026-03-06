/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { PageAccountDelete } from './index';
import { IClientConfig } from '../../../interfaces';
import { GuardEnv, AdminPanelGroup, AdminPanelGuard } from '@fxa/shared/guards';
import { mockConfigBuilder } from '../../lib/config';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { mockDeleteResults, mockTaskStatuses } from './mocks';
import { adminApi } from '../../lib/api';

const mockGuard = new AdminPanelGuard(GuardEnv.Prod);
const mockConfig: IClientConfig = mockConfigBuilder({
  user: {
    email: 'test@mozilla.com',
    group: mockGuard.getGroup(AdminPanelGroup.AdminProd),
  },
});

jest.mock('../../hooks/UserContext.ts', () => ({
  useUserContext: () => ({
    guard: mockGuard,
    user: mockConfig.user,
    setUser: () => {},
  }),
}));

jest.mock('../../lib/api', () => ({
  adminApi: {
    deleteAccounts: jest.fn(),
    getDeleteStatus: jest.fn(),
  },
}));

beforeEach(() => {
  (adminApi.deleteAccounts as jest.Mock).mockResolvedValue(mockDeleteResults);
  (adminApi.getDeleteStatus as jest.Mock).mockResolvedValue(mockTaskStatuses);
});

afterEach(() => {
  jest.clearAllMocks();
});

it('renders without imploding', () => {
  renderWithLocalizationProvider(<PageAccountDelete />);

  expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
    'Delete Accounts'
  );
});

it('deletes accounts', async () => {
  renderWithLocalizationProvider(<PageAccountDelete />);

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
