/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { fireEvent, screen } from '@testing-library/react';
import { logViewEvent, usePageViewEvent } from '../../../lib/metrics';
import FlowRecoveryKeyInfo, {
  viewName,
  forwardNavigationEventName,
  backwardNavigationEventName,
} from './';
import { renderWithRouter } from '../../../models/mocks';

const navigateForward = jest.fn();
const navigateBackward = jest.fn();
const localizedPageTitle = 'Account Recovery Key';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
}));

describe('FlowRecoveryKeyInfo', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders as expected', async () => {
    renderWithRouter(
      <FlowRecoveryKeyInfo
        {...{ localizedPageTitle, navigateForward, navigateBackward }}
      />
    );
    expect(
      screen.getByText(
        'Create an account recovery key in case you forget your password'
      )
    ).toBeInTheDocument();
  });

  it('emits the expected metrics when the user lands on this step of the flow', () => {
    renderWithRouter(
      <FlowRecoveryKeyInfo
        {...{ localizedPageTitle, navigateForward, navigateBackward }}
      />
    );
    expect(usePageViewEvent).toBeCalledWith(viewName);
  });

  it('emits the expected metrics when user navigates forward', () => {
    renderWithRouter(
      <FlowRecoveryKeyInfo
        {...{ localizedPageTitle, navigateForward, navigateBackward }}
      />
    );
    fireEvent.click(screen.getByText('Start creating your recovery key'));
    expect(navigateForward).toBeCalledTimes(1);
    expect(logViewEvent).toBeCalledWith(viewName, forwardNavigationEventName);
  });

  it('emits the expected metrics when user navigates back', () => {
    renderWithRouter(
      <FlowRecoveryKeyInfo
        {...{ localizedPageTitle, navigateForward, navigateBackward }}
      />
    );
    fireEvent.click(screen.getByTitle('Back to settings'));
    expect(navigateBackward).toBeCalledTimes(1);
    expect(logViewEvent).toBeCalledWith(viewName, backwardNavigationEventName);
  });
});
