/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { fireEvent, screen, within } from '@testing-library/react';
import { logViewEvent } from '../../../lib/metrics';
import FlowRecoveryKeyDownload from './';
import { renderWithRouter } from '../../../models/mocks';
import { MOCK_RECOVERY_KEY_VALUE } from './mocks';

const localizedBackButtonTitle = 'Back to settings';
const localizedPageTitle = 'Account Recovery Key';
const navigateForward = jest.fn();
const navigateBackward = jest.fn();
const viewName = 'settings.account-recovery';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
}));

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
      name: 'Account recovery key generated — store it in a place you’ll remember',
    });
    screen.getByText(
      'This key will help recover your data if you forget your password.'
    );
    screen.getByRole('heading', {
      level: 3,
      name: 'Some ideas for storing your account recovery key:',
    });
    const list = screen.getByRole('list', {
      name: 'Some ideas for storing your account recovery key:',
    });
    const listItems = within(list).getAllByRole('listitem');
    expect(listItems.length).toBe(4);

    screen.getByText(MOCK_RECOVERY_KEY_VALUE);
    screen.getByRole('button', { name: 'Copy' });
    screen.getByText('Download your account recovery key');
    screen.getByRole('link', { name: 'Next' });
  });

  // TODO metric for copy button

  // TODO expect file download to be triggered

  it('emits the expected metrics when user downloads the recovery key', () => {
    renderFlowPage();
    const downloadButton = screen.getByText(
      'Download your account recovery key'
    );
    fireEvent.click(downloadButton);
    expect(navigateForward).toBeCalledTimes(1);
    expect(logViewEvent).toBeCalledWith(
      `flow.${viewName}`,
      'recovery-key.download-option'
    );
  });

  it('emits the expected metrics when user navigates forward without downloading the key', () => {
    renderFlowPage();
    const nextPageLink = screen.getByRole('link', { name: 'Next' });
    fireEvent.click(nextPageLink);
    expect(navigateForward).toBeCalledTimes(1);
    expect(logViewEvent).toBeCalledWith(
      `flow.${viewName}`,
      'recovery-key.skip-download'
    );
  });

  // TODO expect metric event when back arrow clicked
});
