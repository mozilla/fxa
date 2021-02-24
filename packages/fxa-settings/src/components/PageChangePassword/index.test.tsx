/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'mutationobserver-shim';
import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { act, fireEvent, screen, wait } from '@testing-library/react';
import { AuthContext, createAuthClient } from '../../lib/auth';
import { HomePath } from '../../constants';
import { MockedCache, renderWithRouter } from '../../models/_mocks';
import PageChangePassword from '.';
import {
  logViewEvent,
  settingsViewName,
  usePageViewEvent,
} from '../../lib/metrics';
import { typeByTestIdFn } from '../../lib/test-utils';

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
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
  settingsViewName: 'quuz',
}));
const mockNavigate = jest.fn();
jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useNavigate: () => mockNavigate,
}));

const client = createAuthClient('none');

const render = async () => {
  await renderWithRouter(
    <AuthContext.Provider value={{ auth: client }}>
      <MockedCache>
        <PageChangePassword />
      </MockedCache>
    </AuthContext.Provider>
  );
};

const changePassword = async () => {
  await render();
  await inputCurrentPassword('quuz');
  await inputNewPassword('testotesto');
  await inputVerifyPassword('testotesto');
  await act(async () => {
    fireEvent.click(screen.getByTestId('save-password-button'));
  });
};

const inputCurrentPassword = typeByTestIdFn('current-password-input-field');
const inputNewPassword = typeByTestIdFn('new-password-input-field');
const inputVerifyPassword = typeByTestIdFn('verify-password-input-field');

it('renders', async () => {
  await render();
  expect(screen.getByTestId('flow-container')).toBeInTheDocument();
  expect(screen.getByTestId('flow-container-back-btn')).toBeInTheDocument();
  expect(screen.getByTestId('nav-link-common-passwords')).toBeInTheDocument();
  expect(screen.getByTestId('nav-link-reset-password')).toBeInTheDocument();
});

it('emits a metrics event on render', async () => {
  await render();
  expect(usePageViewEvent).toHaveBeenCalledWith('settings.change-password');
});

it('emits an Amplitude event on success', async () => {
  await changePassword();
  expect(logViewEvent).toHaveBeenCalledWith(
    settingsViewName,
    'change-password.success'
  );
});

it('redirects on success', async () => {
  await changePassword();
  expect(mockNavigate).toHaveBeenCalledWith(HomePath + '#password', {
    replace: true,
  });
});

it('disables save until the form is valid', async () => {
  await render();
  expect(screen.getByTestId('save-password-button')).toBeDisabled();
  await inputCurrentPassword('quuz');
  expect(screen.getByTestId('save-password-button')).toBeDisabled();
  await inputNewPassword('testotesto');
  expect(screen.getByTestId('save-password-button')).toBeDisabled();
  await inputVerifyPassword('testotesto');
  expect(screen.getByTestId('save-password-button')).toBeEnabled();
});

it('shows validation feedback', async () => {
  await render();
  await inputNewPassword('password');
  expect(screen.getByTestId('change-password-common')).toContainElement(
    screen.getByTestId('icon-invalid')
  );
});

it('shows an error when old and new password are the same', async () => {
  await render();
  await inputCurrentPassword('testotesto');
  await inputNewPassword('testotesto');
  await inputVerifyPassword('testotesto');
  await act(async () => {
    fireEvent.click(screen.getByTestId('save-password-button'));
  });

  await wait(async () => {
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toHaveTextContent(
      'new password must be different'
    );
  });
});
