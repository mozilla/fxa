/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'mutationobserver-shim';
import React from 'react';
import { screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { MockedCache, renderWithRouter, mockEmail } from '../../models/_mocks';
import { PageRecoveryKeyAdd } from '.';

describe('PageRecoveryKeyAdd', () => {
  it('renders as expected', () => {
    renderWithRouter(
      <MockedCache>
        <PageRecoveryKeyAdd />
      </MockedCache>
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
      <MockedCache>
        <PageRecoveryKeyAdd />
      </MockedCache>
    );

    expect(screen.getByTestId('continue-button')).toBeDisabled();

    await act(async () => {
      const input = screen.getByTestId('input-field');
      fireEvent.input(input, { target: { value: 'myFavPassword' } });
    });

    expect(screen.getByTestId('continue-button')).toBeEnabled();
  });

  it('Do not Enable "continue" button if validation fails', async () => {
    renderWithRouter(
      <MockedCache>
        <PageRecoveryKeyAdd />
      </MockedCache>
    );

    await act(async () => {
      const input = screen.getByTestId('input-field');
      fireEvent.input(input, { target: { value: '2short' } });
    });

    expect(screen.getByTestId('continue-button')).toBeDisabled();
  });
});
