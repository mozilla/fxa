/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { logViewEvent } from '../../../lib/metrics';
import FlowRecoveryKeyDownload from './';
import { renderWithRouter } from '../../../models/mocks';
import { MOCK_RECOVERY_KEY_VALUE } from './mocks';
import { MOCK_EMAIL } from '../../../pages/mocks';

const localizedBackButtonTitle = 'Back to settings';
const localizedPageTitle = 'Account Recovery Key';
const navigateForward = jest.fn();
const navigateBackward = jest.fn();
const viewName = 'settings.account-recovery';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
}));

jest.mock('@react-pdf/renderer', () => {
  return {
    pdf: jest.fn().mockResolvedValue({
      toBlob: jest.fn().mockResolvedValue(new Blob()),
      updateContainer: jest.fn(),
    }),
  };
});

const renderFlowPage = () => {
  window.URL.createObjectURL = jest.fn();
  renderWithRouter(
    <FlowRecoveryKeyDownload
      {...{
        localizedBackButtonTitle,
        localizedPageTitle,
        navigateForward,
        navigateBackward,
        viewName,
      }}
      email={MOCK_EMAIL}
      recoveryKeyValue={MOCK_RECOVERY_KEY_VALUE}
    />
  );
};

describe('FlowRecoveryKeyDownload', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders as expected', async () => {
    renderFlowPage();

    screen.getByRole('heading', {
      level: 2,
      name: 'Account recovery key created — Download and store it now',
    });

    screen.getByText(
      'This key allows you to recover your data if you forget your password. Download it now and store it somewhere you’ll remember — you won’t be able to return to this page later.'
    );
    // Renders RecoveryKeySetupDownload
    screen.getByRole('heading', {
      level: 3,
      name: 'Places to store your key:',
    });
  });

  it('emits the expected metrics when user copies the recovery key', async () => {
    renderFlowPage();
    const copyButton = screen.getByRole('button', { name: 'Copy' });
    fireEvent.click(copyButton);
    await waitFor(() =>
      expect(logViewEvent).toBeCalledWith(
        `flow.${viewName}`,
        'recovery-key.copy-option'
      )
    );
  });

  it('emits the expected metrics when user downloads the recovery key', async () => {
    renderFlowPage();
    const downloadButton = screen.getByText('Download and continue');
    fireEvent.click(downloadButton);
    await waitFor(() => {
      expect(logViewEvent).toBeCalledWith(
        `flow.${viewName}`,
        'recovery-key.download-option'
      );
    });
  });

  it('emits the expected metrics when user navigates forward', () => {
    renderFlowPage();
    const nextPageLink = screen.getByRole('button', {
      name: 'Continue without downloading',
    });
    fireEvent.click(nextPageLink);
    expect(logViewEvent).toBeCalledWith(
      `flow.${viewName}`,
      'recovery-key.skip-download'
    );
    expect(navigateForward).toBeCalledTimes(1);
  });

  it('emits the expected metrics when user clicks the back arrow', () => {
    renderFlowPage();
    const backLink = screen.getByRole('button', { name: 'Back to settings' });
    fireEvent.click(backLink);
    expect(navigateBackward).toBeCalledTimes(1);
    expect(logViewEvent).toBeCalledWith(
      `flow.${viewName}`,
      'recovery-key.skip-download'
    );
  });
});
