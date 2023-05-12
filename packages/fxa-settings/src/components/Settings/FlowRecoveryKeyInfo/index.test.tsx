/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { fireEvent, screen } from '@testing-library/react';
import { logViewEvent } from '../../../lib/metrics';
import FlowRecoveryKeyInfo, {
  forwardNavigationEventName,
  backwardNavigationEventName,
} from './';
import { renderWithRouter } from '../../../models/mocks';

const navigateForward = jest.fn();
const navigateBackward = jest.fn();
const localizedBackButtonTitle = 'Back to settings';
const localizedPageTitle = 'Account Recovery Key';
const viewName = 'settings.account-recovery';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
}));

const renderFlowPage = () => {
  renderWithRouter(
    <FlowRecoveryKeyInfo
      {...{
        localizedBackButtonTitle,
        localizedPageTitle,
        navigateForward,
        navigateBackward,
        viewName,
      }}
    />
  );
};

describe('FlowRecoveryKeyInfo', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders as expected', async () => {
    renderFlowPage();
    expect(
      screen.getByRole('heading', {
        name: 'Create an account recovery key in case you forget your password',
      })
    ).toBeInTheDocument();
  });

  it('emits the expected metrics when user navigates forward', () => {
    renderFlowPage();
    fireEvent.click(
      screen.getByText('Start creating your account recovery key')
    );
    expect(navigateForward).toBeCalledTimes(1);
    expect(logViewEvent).toBeCalledWith(
      `flow.${viewName}`,
      forwardNavigationEventName
    );
  });

  it('emits the expected metrics when user navigates back', () => {
    renderFlowPage();
    fireEvent.click(screen.getByTitle('Back to settings'));
    expect(navigateBackward).toBeCalledTimes(1);
    expect(logViewEvent).toBeCalledWith(
      `flow.${viewName}`,
      backwardNavigationEventName
    );
  });
});
