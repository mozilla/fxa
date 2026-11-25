/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { fireEvent, screen } from '@testing-library/react';
import { logViewEvent } from '../../../lib/metrics';
import FlowRecoveryKeyInfo from './';
import { renderWithRouter } from '../../../models/mocks';
import { RecoveryKeyAction } from '../PageRecoveryKeyCreate';
import GleanMetrics from '../../../lib/glean';

const navigateForward = jest.fn();
const navigateBackward = jest.fn();
const localizedBackButtonTitle = 'Back to settings';
const localizedPageTitle = 'Account Recovery Key';
const viewName = 'settings.account-recovery';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
}));

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: { recoveryKey: { infoView: jest.fn() } },
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
    expect(logViewEvent).toHaveBeenCalledTimes(1);
    expect(logViewEvent).toHaveBeenCalledWith(
      `flow.${viewName}`,
      'create-key.info'
    );
  });

  it('emits the expected metrics when user navigates forward', () => {
    renderFlowPage(RecoveryKeyAction.Create);
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Get started',
      })
    );
    expect(navigateForward).toHaveBeenCalledTimes(1);
    expect(logViewEvent).toHaveBeenCalledWith(
      `flow.${viewName}`,
      'create-key.info'
    );
    expect(logViewEvent).toHaveBeenCalledWith(
      `flow.${viewName}`,
      'create-key.start'
    );
  });

  it('emits the expected metrics when user navigates back', () => {
    renderFlowPage(RecoveryKeyAction.Create);
    fireEvent.click(screen.getByTestId('flow-container-back-btn'));
    expect(navigateBackward).toHaveBeenCalledTimes(1);
    expect(logViewEvent).toHaveBeenCalledWith(
      `flow.${viewName}`,
      'create-key.cancel'
    );
  });
});

describe('FlowRecoveryKeyInfo Glean events', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('records the info view once', () => {
    renderFlowPage(RecoveryKeyAction.Create);
    expect(GleanMetrics.recoveryKey.infoView).toHaveBeenCalledTimes(1);
  });

  it('sets data-glean-id on the start and cancel controls', () => {
    renderFlowPage(RecoveryKeyAction.Change);
    expect(screen.getByRole('button', { name: 'Get started' })).toHaveAttribute(
      'data-glean-id',
      'recovery_key_info_start'
    );
    expect(screen.getByRole('link', { name: 'Cancel' })).toHaveAttribute(
      'data-glean-id',
      'recovery_key_info_cancel'
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
    expect(logViewEvent).toHaveBeenCalledTimes(1);
    expect(logViewEvent).toHaveBeenCalledWith(
      `flow.${viewName}`,
      'change-key.info'
    );
  });

  it('emits the expected metrics when user navigates forward', () => {
    renderFlowPage(RecoveryKeyAction.Change);
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Get started',
      })
    );
    expect(navigateForward).toHaveBeenCalledTimes(1);
    expect(logViewEvent).toHaveBeenCalledWith(
      `flow.${viewName}`,
      'change-key.info'
    );
    expect(logViewEvent).toHaveBeenCalledWith(
      `flow.${viewName}`,
      'change-key.start'
    );
  });

  it('emits the expected metrics when user navigates back', () => {
    renderFlowPage(RecoveryKeyAction.Change);
    fireEvent.click(screen.getByTestId('flow-container-back-btn'));
    expect(navigateBackward).toHaveBeenCalledTimes(1);
    expect(logViewEvent).toHaveBeenCalledWith(
      `flow.${viewName}`,
      'change-key.cancel'
    );
  });

  it('emits the expected metrics when key change is cancelled', () => {
    renderFlowPage(RecoveryKeyAction.Change);
    fireEvent.click(screen.getByRole('link', { name: 'Cancel' }));
    expect(logViewEvent).toHaveBeenCalledWith(
      `flow.${viewName}`,
      'change-key.cancel'
    );
  });
});
