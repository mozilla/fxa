/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'mutationobserver-shim';
import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { act, fireEvent, screen } from '@testing-library/react';
import PageDisplayName from '.';
import {
  MockedCache,
  MOCK_ACCOUNT,
  renderWithRouter,
} from 'fxa-settings/src/models/_mocks';
import { AuthContext, createAuthClient } from 'fxa-settings/src/lib/auth';

const client = createAuthClient('none');

it('renders', async () => {
  renderWithRouter(
    <AuthContext.Provider value={{ auth: client }}>
      <MockedCache>
        <PageDisplayName />
      </MockedCache>
    </AuthContext.Provider>
  );
  expect(screen.getByTestId('flow-container')).toBeInTheDocument();
  expect(screen.getByTestId('flow-container-back-btn')).toBeInTheDocument();
  expect(screen.getByTestId('input-field')).toBeInTheDocument();
  expect(screen.getByTestId('submit-display-name')).toBeInTheDocument();
});

it('updates the disabled state of the save button', async () => {
  renderWithRouter(
    <AuthContext.Provider value={{ auth: client }}>
      <MockedCache>
        <PageDisplayName />
      </MockedCache>
    </AuthContext.Provider>
  );

  // initial value
  expect(screen.getByTestId('submit-display-name')).toBeDisabled();

  // empty value
  await act(async () => {
    fireEvent.input(screen.getAllByTestId('input-field')[0], {
      target: { value: '' },
    });
  });
  expect(screen.getByTestId('submit-display-name')).toBeDisabled();

  // new value
  await act(async () => {
    fireEvent.input(screen.getAllByTestId('input-field')[0], {
      target: { value: 'testo' },
    });
  });
  expect(screen.getByTestId('submit-display-name')).not.toBeDisabled();

  // original value
  await act(async () => {
    fireEvent.input(screen.getAllByTestId('input-field')[0], {
      target: { value: MOCK_ACCOUNT.displayName },
    });
  });
  expect(screen.getByTestId('submit-display-name')).toBeDisabled();
});
