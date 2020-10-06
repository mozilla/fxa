/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'mutationobserver-shim';
import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { act, fireEvent, screen } from '@testing-library/react';
import { AuthContext, createAuthClient } from '../../lib/auth';
import { MockedCache, renderWithRouter } from '../../models/_mocks';
import PageChangePassword from '.';
import { logViewEvent, settingsViewName } from '../../lib/metrics';

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
    fireEvent.input(screen.getByTestId('current-password-input-field'), {
      target: { value: 'quuz' },
    });
    fireEvent.input(screen.getByTestId('new-password-input-field'), {
      target: { value: 'testotesto' },
    });
    fireEvent.input(screen.getByTestId('verify-password-input-field'), {
      target: { value: 'testotesto' },
    });
  });
  await act(async () => {
    fireEvent.click(screen.getByTestId('save-password-button'));
  });
  expect(logViewEvent).toHaveBeenCalledWith(
    settingsViewName,
    'change-password.success'
  );
});

it('disables save until the form is valid', async () => {
  renderWithRouter(
    <AuthContext.Provider value={{ auth: client }}>
      <MockedCache>
        <PageChangePassword />
      </MockedCache>
    </AuthContext.Provider>
  );
  expect(screen.getByTestId('save-password-button')).toBeDisabled();
  await act(async () => {
    fireEvent.input(screen.getByTestId('current-password-input-field'), {
      target: { value: 'quuz' },
    });
  });
  expect(screen.getByTestId('save-password-button')).toBeDisabled();
  await act(async () => {
    fireEvent.input(screen.getByTestId('new-password-input-field'), {
      target: { value: 'testotesto' },
    });
  });
  expect(screen.getByTestId('save-password-button')).toBeDisabled();
  await act(async () => {
    fireEvent.input(screen.getByTestId('verify-password-input-field'), {
      target: { value: 'testotesto' },
    });
  });
  expect(screen.getByTestId('save-password-button')).toBeEnabled();
});

it('shows validation feedback', async () => {
  renderWithRouter(
    <AuthContext.Provider value={{ auth: client }}>
      <MockedCache>
        <PageChangePassword />
      </MockedCache>
    </AuthContext.Provider>
  );
  await act(async () => {
    fireEvent.input(screen.getByTestId('new-password-input-field'), {
      target: { value: 'password' },
    });
  });
  expect(screen.getByTestId('change-password-common')).toContainElement(
    screen.getByTestId('icon-invalid')
  );
});
