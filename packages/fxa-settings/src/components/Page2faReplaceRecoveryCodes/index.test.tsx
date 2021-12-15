/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'mutationobserver-shim';
import '@testing-library/jest-dom/extend-expect';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { Account, AppContext } from '../../models';
import { Config } from '../../lib/config';
import { HomePath } from '../../constants';
import { typeByTestIdFn } from '../../lib/test-utils';
import { mockAppContext, renderWithRouter } from '../../models/mocks';

import { Page2faReplaceRecoveryCodes } from '.';

jest.mock('../../models/AlertBarInfo');
const recoveryCodes = ['0123456789'];
const account = {
  primaryEmail: {
    email: 'pbooth@mozilla.com',
  },
  generateRecoveryCodes: jest.fn().mockResolvedValue(recoveryCodes),
  updateRecoveryCodes: jest.fn().mockResolvedValue({ success: true }),
} as unknown as Account;

const config = {
  recoveryCodes: {
    count: 1,
    length: 10,
  },
} as Config;

const mockNavigate = jest.fn();
jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useNavigate: () => mockNavigate,
}));

window.URL.createObjectURL = jest.fn();

async function renderPage2faReplaceRecoveryCodes() {
  await act(async () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account, config })}>
        <Page2faReplaceRecoveryCodes />
      </AppContext.Provider>
    );
  });
}

it('renders', async () => {
  await renderPage2faReplaceRecoveryCodes();

  expect(screen.getByTestId('2fa-recovery-codes')).toBeInTheDocument();

  expect(screen.getByTestId('2fa-recovery-codes')).toHaveTextContent(
    recoveryCodes[0]
  );

  expect(screen.getByTestId('ack-recovery-code')).toBeInTheDocument();
});

it('displays an error when fails to fetch new recovery codes', async () => {
  const account = {
    replaceRecoveryCodes: jest.fn().mockRejectedValue(new Error('wat')),
  } as unknown as Account;
  const context = mockAppContext({ account });
  await act(async () => {
    renderWithRouter(
      <AppContext.Provider value={context}>
        <Page2faReplaceRecoveryCodes />
      </AppContext.Provider>
    );
  });
  expect(context.alertBarInfo?.error).toBeCalledTimes(1);
});

it('forces users to validate recovery code', async () => {
  await renderPage2faReplaceRecoveryCodes();
  fireEvent.click(screen.getByTestId('ack-recovery-code'));

  await waitFor(() =>
    expect(screen.getByTestId('submit-recovery-code')).toBeDisabled()
  );
});

it('will not allow bad recovery code', async () => {
  await renderPage2faReplaceRecoveryCodes();
  fireEvent.click(screen.getByTestId('ack-recovery-code'));
  await typeByTestIdFn('recovery-code-input-field')('xyz');
  fireEvent.click(screen.getByTestId('submit-recovery-code'));

  await waitFor(() =>
    expect(screen.getByTestId('tooltip')).toBeInTheDocument()
  );
});

it('allows user to finish', async () => {
  await renderPage2faReplaceRecoveryCodes();

  fireEvent.click(screen.getByTestId('ack-recovery-code'));
  await typeByTestIdFn('recovery-code-input-field')(recoveryCodes[0]);
  fireEvent.click(screen.getByTestId('submit-recovery-code'));

  await waitFor(() =>
    expect(mockNavigate).toHaveBeenCalledWith(
      HomePath + '#two-step-authentication',
      { replace: true }
    )
  );
});
