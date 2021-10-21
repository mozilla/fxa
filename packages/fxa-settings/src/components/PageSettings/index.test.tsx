/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import PageSettings from '.';
import {
  renderWithRouter,
  mockAppContext,
  MOCK_ACCOUNT,
} from '../../models/mocks';
import * as Metrics from '../../lib/metrics';
import { Account, AppContext } from '../../models';

jest.spyOn(Metrics, 'setProperties');
jest.spyOn(Metrics, 'logPageViewEvent');

afterEach(() => {
  jest.clearAllMocks();
});

it('renders without imploding', async () => {
  renderWithRouter(<PageSettings />);
  expect(screen.getByTestId('settings-profile')).toBeInTheDocument();
  expect(screen.getByTestId('settings-security')).toBeInTheDocument();
  expect(screen.getByTestId('settings-connected-services')).toBeInTheDocument();
  expect(screen.getByTestId('settings-delete-account')).toBeInTheDocument();
  // TODO: remove .not, FXA-4106
  expect(
    screen.queryByTestId('settings-data-collection')
  ).not.toBeInTheDocument();

  expect(Metrics.setProperties).toHaveBeenCalledWith({
    uid: 'abc123',
  });
  expect(Metrics.logPageViewEvent).toHaveBeenCalledWith('settings');
});

it('does not log metrics for opted out users', () => {
  renderWithRouter(
    <AppContext.Provider
      value={mockAppContext({
        account: {
          ...MOCK_ACCOUNT,
          metricsEnabled: false,
        } as Account,
      })}
    >
      <PageSettings />
    </AppContext.Provider>
  );

  expect(Metrics.setProperties).not.toHaveBeenCalled();
  expect(Metrics.logPageViewEvent).not.toHaveBeenCalled();
});
