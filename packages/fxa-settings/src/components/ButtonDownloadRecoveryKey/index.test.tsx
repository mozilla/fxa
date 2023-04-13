/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Account, AppContext } from '../../models';
import { ButtonDownloadRecoveryKey } from '.';
import { MOCK_ACCOUNT } from '../../models/mocks';
import { logViewEvent } from '../../lib/metrics';

const recoveryKeyValue = 'WXYZ WXYZ WXYZ WXYZ WXYZ WXYZ';
const viewName = 'settings.account-recovery';

const account = {
  ...MOCK_ACCOUNT,
} as unknown as Account;

jest.mock('../../lib/metrics', () => ({
  logViewEvent: jest.fn(),
}));

it('renders button as expected', () => {
  window.URL.createObjectURL = jest.fn();
  render(
    <AppContext.Provider value={{ account }}>
      <ButtonDownloadRecoveryKey {...{ recoveryKeyValue, viewName }} />
    </AppContext.Provider>
  );
  expect(screen.getByText('Download your recovery key')).toBeInTheDocument();
});

it('emits a metrics event when the link is clicked', async () => {
  window.URL.createObjectURL = jest.fn();
  render(
    <AppContext.Provider value={{ account }}>
      <ButtonDownloadRecoveryKey {...{ recoveryKeyValue, viewName }} />
    </AppContext.Provider>
  );
  const downloadButton = screen.getByText('Download your recovery key');
  fireEvent.click(downloadButton);

  expect(logViewEvent).toHaveBeenCalledWith(
    `flow.${viewName}`,
    'recovery-key.download-option'
  );
});
