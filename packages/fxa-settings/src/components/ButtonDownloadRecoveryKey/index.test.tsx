/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Account, AppContext } from '../../models';
import { ButtonDownloadRecoveryKey } from '.';
import { MOCK_ACCOUNT } from '../../models/mocks';
import { logViewEvent } from '../../lib/metrics';

const recoveryKeyValue = 'WXYZ WXYZ WXYZ WXYZ WXYZ WXYZ WXYZ WXYZ';
const viewName = 'settings.account-recovery';

const account = {
  ...MOCK_ACCOUNT,
} as unknown as Account;

const accountWithLongEmail = {
  ...MOCK_ACCOUNT,
  primaryEmail: {
    email:
      'supercalifragilisticexpialidocious@marypoppins.superfan.conference.com',
  },
} as unknown as Account;

jest.mock('../../lib/metrics', () => ({
  logViewEvent: jest.fn(),
}));

beforeAll(() => {
  window.URL.createObjectURL = jest.fn();
});

describe('ButtonDownloadRecoveryKey', () => {
  it('renders button as expected', () => {
    render(
      <AppContext.Provider value={{ account }}>
        <ButtonDownloadRecoveryKey {...{ recoveryKeyValue, viewName }} />
      </AppContext.Provider>
    );
    screen.getByText('Download and continue');
  });

  it('sets the filename as expected with a reasonably-sized email', () => {
    render(
      <AppContext.Provider value={{ account }}>
        <ButtonDownloadRecoveryKey {...{ recoveryKeyValue, viewName }} />
      </AppContext.Provider>
    );
    const downloadButtonDownloadAttribute = screen
      .getByText('Download and continue')
      .getAttribute('download');

    // Test the date formatting
    const mockDateObject = '2023-05-10T17:00:40.722Z';
    const mockDateFunctionOutput = new Date(mockDateObject)
      .toISOString()
      .split('T')[0];
    const mockExpectedDate = '2023-05-10';

    expect(mockDateFunctionOutput).toEqual(mockExpectedDate);

    // Filename should be created from current date
    const date = new Date().toISOString().split('T')[0];

    expect(downloadButtonDownloadAttribute).toContain(
      `Firefox-Recovery-Key_${date}_${account.primaryEmail.email}.txt`
    );
    expect(downloadButtonDownloadAttribute!.length).toBeLessThanOrEqual(75);
  });

  it('sets the filename with a truncated email as expected when the email is very long', () => {
    render(
      <AppContext.Provider value={{ account: accountWithLongEmail }}>
        <ButtonDownloadRecoveryKey {...{ recoveryKeyValue, viewName }} />
      </AppContext.Provider>
    );
    const downloadButtonDownloadAttribute = screen
      .getByText('Download and continue')
      .getAttribute('download');
    const currentDate = new Date();
    const date = currentDate.toISOString().split('T')[0];
    const fullFilename = `Firefox-Recovery-Key_${date}_${accountWithLongEmail.primaryEmail.email}.txt`;
    // Full filename would be longer than 75 char if not truncated
    expect(fullFilename.length).toBeGreaterThan(75);
    // actual filename is truncated
    expect(downloadButtonDownloadAttribute!.length).toBeLessThanOrEqual(75);
    // filename still contains full prefix and date
    expect(downloadButtonDownloadAttribute).toContain('Firefox-Recovery-Key');
    expect(downloadButtonDownloadAttribute).toContain(date);
  });

  // Content of downloaded file is tested in Playwright tests
  // including validating that the expected key is included and matches the key in the DataBlock

  it('emits a metrics event when the link is clicked', () => {
    render(
      <AppContext.Provider value={{ account }}>
        <ButtonDownloadRecoveryKey {...{ recoveryKeyValue, viewName }} />
      </AppContext.Provider>
    );
    const downloadButton = screen.getByText('Download and continue');
    fireEvent.click(downloadButton);

    expect(logViewEvent).toHaveBeenCalledWith(
      `flow.${viewName}`,
      'recovery-key.download-option'
    );
  });
});
