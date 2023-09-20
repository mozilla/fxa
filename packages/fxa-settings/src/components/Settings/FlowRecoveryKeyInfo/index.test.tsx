/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { logViewEvent } from '../../../lib/metrics';
import FlowRecoveryKeyInfo from './';
import { renderWithRouter } from '../../../models/mocks';
import { RecoveryKeyAction } from '../PageRecoveryKeyCreate';

const navigateForward = jest.fn();
const navigateBackward = jest.fn();
const localizedBackButtonTitle = 'Back to settings';
const localizedPageTitle = 'Account Recovery Key';
const viewName = 'settings.account-recovery';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
}));

const renderFlowPage = (action: RecoveryKeyAction) => {
  renderWithRouter(
    <FlowRecoveryKeyInfo
      {...{
        action,
        localizedBackButtonTitle,
        localizedPageTitle,
        navigateForward,
        navigateBackward,
        viewName,
      }}
    />
  );
};

describe('FlowRecoveryKeyInfo for key creation', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders as expected', async () => {
    renderFlowPage(RecoveryKeyAction.Create);
    screen.getByRole('heading', {
      name: 'Create an account recovery key in case you forget your password',
    });
    screen.getByRole('button', {
      name: 'Get started',
    });
  });

  it('emits the expected metrics on render', () => {
    renderFlowPage(RecoveryKeyAction.Create);
    expect(logViewEvent).toBeCalledTimes(1);
    expect(logViewEvent).toBeCalledWith(`flow.${viewName}`, 'create-key.info');
  });

  it('emits the expected metrics when user navigates forward', () => {
    renderFlowPage(RecoveryKeyAction.Create);
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Get started',
      })
    );
    expect(navigateForward).toBeCalledTimes(1);
    expect(logViewEvent).toBeCalledWith(`flow.${viewName}`, 'create-key.info');
    expect(logViewEvent).toBeCalledWith(`flow.${viewName}`, 'create-key.start');
  });

  it('emits the expected metrics when user navigates back', () => {
    renderFlowPage(RecoveryKeyAction.Create);
    fireEvent.click(screen.getByTestId('flow-container-back-btn'));
    expect(navigateBackward).toBeCalledTimes(1);
    expect(logViewEvent).toBeCalledWith(
      `flow.${viewName}`,
      'create-key.cancel'
    );
  });
});

describe('FlowRecoveryKeyInfo for key replacement', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders as expected', async () => {
    renderFlowPage(RecoveryKeyAction.Change);
    screen.getByRole('heading', {
      name: 'Change your account recovery key',
    });
    screen.getByRole('button', { name: 'Get started' });
    screen.getByRole('link', { name: 'Cancel' });
  });

  it('emits the expected metrics on render', () => {
    renderFlowPage(RecoveryKeyAction.Change);
    expect(logViewEvent).toBeCalledTimes(1);
    expect(logViewEvent).toBeCalledWith(`flow.${viewName}`, 'change-key.info');
  });

  it('emits the expected metrics when user navigates forward', () => {
    renderFlowPage(RecoveryKeyAction.Change);
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Get started',
      })
    );
    expect(navigateForward).toBeCalledTimes(1);
    expect(logViewEvent).toBeCalledWith(`flow.${viewName}`, 'change-key.info');
    expect(logViewEvent).toBeCalledWith(`flow.${viewName}`, 'change-key.start');
  });

  it('emits the expected metrics when user navigates back', () => {
    renderFlowPage(RecoveryKeyAction.Change);
    fireEvent.click(screen.getByTestId('flow-container-back-btn'));
    expect(navigateBackward).toBeCalledTimes(1);
    expect(logViewEvent).toBeCalledWith(
      `flow.${viewName}`,
      'change-key.cancel'
    );
  });

  it('emits the expected metrics when key change is cancelled', () => {
    renderFlowPage(RecoveryKeyAction.Change);
    fireEvent.click(screen.getByRole('link', { name: 'Cancel' }));
    expect(logViewEvent).toBeCalledWith(
      `flow.${viewName}`,
      'change-key.cancel'
    );
  });
});
