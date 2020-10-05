/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { act, fireEvent, screen } from '@testing-library/react';
import { AuthContext, createAuthClient } from '../../lib/auth';
import { MockedCache, renderWithRouter } from '../../models/_mocks';
import PageChangePassword from '.';
import { logViewEvent, settingsViewName } from 'fxa-settings/src/lib/metrics';

jest.mock('../../lib/auth', () => ({
  ...jest.requireActual('../../lib/auth'),
  usePasswordChanger: jest
    .fn()
    .mockImplementation(({ onSuccess, onError }) => ({
      execute: () => onSuccess({ sessionToken: 'FFFF' }),
      reset: () => {},
    })),
}));
jest.mock('fxa-settings/src/lib/metrics', () => ({
  logViewEvent: jest.fn(),
  settingsViewName: 'quuz',
}));

const client = createAuthClient('none');

it('renders', async () => {
  renderWithRouter(
    <AuthContext.Provider value={{ auth: client }}>
      <MockedCache>
        <PageChangePassword />
      </MockedCache>
    </AuthContext.Provider>
  );
  expect(screen.getByTestId('flow-container')).toBeInTheDocument();
  expect(screen.getByTestId('flow-container-back-btn')).toBeInTheDocument();
  expect(screen.getByTestId('nav-link-common-passwords')).toBeInTheDocument();
  expect(screen.getByTestId('nav-link-reset-password')).toBeInTheDocument();
});

it('emits an Amplitude event on success', async () => {
  renderWithRouter(
    <AuthContext.Provider value={{ auth: client }}>
      <MockedCache>
        <PageChangePassword />
      </MockedCache>
    </AuthContext.Provider>
  );
  await act(async () => {
    fireEvent.change(screen.getAllByTestId('input-field')[0], {
      target: { value: 'quuz' },
    });
    fireEvent.change(screen.getAllByTestId('input-field')[1], {
      target: { value: 'testo' },
    });
    fireEvent.change(screen.getAllByTestId('input-field')[2], {
      target: { value: 'testo' },
    });
  });
  await act(async () => {
    fireEvent.click(screen.getByTestId('submit-change-password'));
  });
  expect(logViewEvent).toHaveBeenCalledWith(
    settingsViewName,
    'change-password.success'
  );
});
