/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'mutationobserver-shim';
import React from 'react';
import { screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { AuthContext, createAuthClient } from '../../lib/auth';
import { MockedCache, renderWithRouter, mockEmail } from '../../models/_mocks';
import { PageRecoveryKeyAdd } from '.';

jest.mock('../../lib/auth', () => ({
  ...jest.requireActual('../../lib/auth'),
  useRecoveryKeyMaker: jest
    .fn()
    .mockImplementation(({ onSuccess, onError }) => ({
      execute: () => onSuccess(new Uint8Array(20)),
      reset: () => {},
    })),
}));

const client = createAuthClient('none');
window.URL.createObjectURL = jest.fn();

describe('PageRecoveryKeyAdd', () => {
  it('renders as expected', () => {
    renderWithRouter(
      <AuthContext.Provider value={{ auth: client }}>
        <MockedCache>
          <PageRecoveryKeyAdd />
        </MockedCache>
      </AuthContext.Provider>
    );

    expect(screen.getByTestId('recovery-key-input').textContent).toContain(
      'Enter password'
    );
    expect(screen.getByTestId('cancel-button').textContent).toContain('Cancel');
    expect(screen.getByTestId('continue-button').textContent).toContain(
      'Continue'
    );
  });

  it('Enables "continue" button once input is valid', async () => {
    renderWithRouter(
      <AuthContext.Provider value={{ auth: client }}>
        <MockedCache>
          <PageRecoveryKeyAdd />
        </MockedCache>
      </AuthContext.Provider>
    );

    expect(screen.getByTestId('continue-button')).toBeDisabled();

    await act(async () => {
      const input = screen.getByTestId('input-field');
      fireEvent.input(input, { target: { value: 'myFavPassword' } });
    });

    expect(screen.getByTestId('continue-button')).toBeEnabled();
  });

  it('Does not Enable "continue" button if validation fails', async () => {
    renderWithRouter(
      <AuthContext.Provider value={{ auth: client }}>
        <MockedCache>
          <PageRecoveryKeyAdd />
        </MockedCache>
      </AuthContext.Provider>
    );

    await act(async () => {
      const input = screen.getByTestId('input-field');
      fireEvent.input(input, { target: { value: '2short' } });
    });

    expect(screen.getByTestId('continue-button')).toBeDisabled();
  });

  it('Generates a recovery key on submit', async () => {
    renderWithRouter(
      <AuthContext.Provider value={{ auth: client }}>
        <MockedCache>
          <PageRecoveryKeyAdd />
        </MockedCache>
      </AuthContext.Provider>
    );

    await act(async () => {
      const input = screen.getByTestId('input-field');
      await fireEvent.input(input, { target: { value: 'myFavPassword' } });
      await fireEvent.click(screen.getByTestId('continue-button'));
    });

    expect(screen.getByTestId('recover-key-confirm')).toBeVisible();
    expect(screen.getByTestId('datablock')).toHaveTextContent(
      '0000 0000 0000 0000 0000 0000 0000 0000'
    );
    expect(screen.getByTestId('databutton-copy')).toBeEnabled();
    expect(screen.getByTestId('close-button')).toBeEnabled();
  });
});
