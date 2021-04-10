/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'mutationobserver-shim';
import '@testing-library/jest-dom/extend-expect';
import { act, screen } from '@testing-library/react';
import { Account, AppContext } from '../../models';
import { renderWithRouter, mockSession } from '../../models/_mocks';
import React from 'react';

import { Page2faReplaceRecoveryCodes } from '.';
import { AlertBarRootAndContextProvider } from '../../lib/AlertBarContext';

const recoveryCodes = ['abc123'];
const account = ({
  primaryEmail: {
    email: 'pbooth@mozilla.com',
  },
  replaceRecoveryCodes: jest.fn().mockResolvedValue({ recoveryCodes }),
} as unknown) as Account;
const session = mockSession();

window.URL.createObjectURL = jest.fn();

it('renders', async () => {
  await act(async () => {
    renderWithRouter(
      <AppContext.Provider value={{ account, session }}>
        <Page2faReplaceRecoveryCodes />
      </AppContext.Provider>
    );
  });

  expect(screen.getByTestId('2fa-recovery-codes')).toBeInTheDocument();

  expect(screen.getByTestId('2fa-recovery-codes')).toHaveTextContent(
    recoveryCodes[0]
  );
});

it('displays an error when fails to fetch new recovery codes', async () => {
  const account = ({
    replaceRecoveryCodes: jest.fn().mockRejectedValue(new Error('wat')),
  } as unknown) as Account;
  await act(async () => {
    renderWithRouter(
      <AppContext.Provider value={{ account, session }}>
        <AlertBarRootAndContextProvider>
          <Page2faReplaceRecoveryCodes />
        </AlertBarRootAndContextProvider>
      </AppContext.Provider>
    );
  });
  expect(screen.getByTestId('alert-bar')).toBeInTheDocument();
});
