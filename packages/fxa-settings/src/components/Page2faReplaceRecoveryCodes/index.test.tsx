/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'mutationobserver-shim';
import '@testing-library/jest-dom/extend-expect';
import { act, screen, wait } from '@testing-library/react';
import { AuthContext, createAuthClient } from '../../lib/auth';
import { renderWithRouter, MockedCache } from '../../models/_mocks';
import React from 'react';
import {
  CHANGE_RECOVERY_CODE_ERROR_MOCK,
  CHANGE_RECOVERY_CODE_MOCK,
} from './_mocks';
import { Page2faReplaceRecoveryCodes } from '.';
import { AlertBarRootAndContextProvider } from '../../lib/AlertBarContext';

window.URL.createObjectURL = jest.fn();
const client = createAuthClient('none');

it('renders', async () => {
  await act(async () => {
    renderWithRouter(
      <AuthContext.Provider value={{ auth: client }}>
        <MockedCache {...{ mocks: CHANGE_RECOVERY_CODE_MOCK }}>
          <Page2faReplaceRecoveryCodes />
        </MockedCache>
      </AuthContext.Provider>
    );
  });

  expect(screen.getByTestId('2fa-recovery-codes')).toBeInTheDocument();
  await wait(() => {
    expect(screen.getByTestId('2fa-recovery-codes')).toHaveTextContent(
      CHANGE_RECOVERY_CODE_MOCK[0].result.data.changeRecoveryCodes
        .recoveryCodes[0]
    );
  });
});

it('displays an error when fails to fetch new recovery codes', async () => {
  await act(async () => {
    renderWithRouter(
      <AuthContext.Provider value={{ auth: client }}>
        <MockedCache {...{ mocks: CHANGE_RECOVERY_CODE_ERROR_MOCK }}>
          <AlertBarRootAndContextProvider>
            <Page2faReplaceRecoveryCodes />
          </AlertBarRootAndContextProvider>
        </MockedCache>
      </AuthContext.Provider>
    );
  });
  await wait(() => expect(screen.getByTestId('alert-bar')).toBeInTheDocument());
});
