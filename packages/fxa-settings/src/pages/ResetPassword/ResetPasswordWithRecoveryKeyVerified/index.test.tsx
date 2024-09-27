/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
// import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';
import ResetPasswordWithRecoveryKeyVerified, { viewName } from '.';
import { logViewEvent } from '../../../lib/metrics';
import { REACT_ENTRYPOINT } from '../../../constants';
import {
  createHistoryWithQuery,
  renderWithRouter,
} from '../../../models/mocks';
import {
  createMockSyncDesktopV3Integration,
  createMockResetPasswordWithRecoveryKeyVerifiedWebIntegration,
} from './mocks';
import GleanMetrics from '../../../lib/glean';

jest.mock('../../../lib/metrics', () => ({
  logViewEvent: jest.fn(),
  usePageViewEvent: jest.fn(),
}));

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {
    passwordReset: {
      recoveryKeyResetSuccessView: jest.fn(),
    },
  },
}));

afterEach(() => {
  jest.clearAllMocks();
});

const route = 'reset_password_with_recovery_key_verified';
const render = (
  ui: any = <ResetPasswordWithRecoveryKeyVerifiedWithWebIntegration />
) => {
  const history = createHistoryWithQuery(route);
  const result = renderWithRouter(ui, {
    route,
    history,
  });
  return result;
};

const ResetPasswordWithRecoveryKeyVerifiedWithWebIntegration = ({
  isSignedIn = true,
}) => (
  <ResetPasswordWithRecoveryKeyVerified
    integration={createMockResetPasswordWithRecoveryKeyVerifiedWebIntegration()}
    {...{ isSignedIn }}
  />
);

const ResetPasswordWithRecoveryKeyVerifiedWithSyncDesktopV3Integration = ({
  isSignedIn = true,
}) => (
  <ResetPasswordWithRecoveryKeyVerified
    integration={createMockSyncDesktopV3Integration()}
    {...{ isSignedIn }}
  />
);

describe('ResetPasswordWithRecoveryKeyVerified', () => {
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });

  const startBrowsingText = 'Manage your account';
  const signedInText = 'You’re now ready to use account settings';
  const singedOutText = 'Your account is ready!';
  const syncText =
    'Complete setup by entering your new password on your other Firefox devices.';
  const createRecoveryKeyText = 'Generate a new account recovery key';
  const continueToAccountText = 'Continue to my account';

  it('renders default content', async () => {
    render();
    // testAllL10n(screen, bundle);
    await screen.findByText(signedInText);
    screen.getByText(createRecoveryKeyText);
    screen.getByText(continueToAccountText);
  });

  it('renders default content when signed out', async () => {
    render(
      <ResetPasswordWithRecoveryKeyVerifiedWithWebIntegration
        isSignedIn={false}
      />
    );
    await screen.findByText(singedOutText);
    screen.getByText(createRecoveryKeyText);
    screen.getByText(continueToAccountText);
  });

  it('renders default content for sync service', async () => {
    render(
      <ResetPasswordWithRecoveryKeyVerifiedWithSyncDesktopV3Integration />
    );
    await screen.findByText(syncText);
    screen.getByText(startBrowsingText);
    screen.getByText(createRecoveryKeyText);
    screen.getByText(continueToAccountText);
  });

  it('emits the expected metrics when a user generates new recovery keys', async () => {
    render();
    const newAccountRecoveryKeyButton = await screen.findByText(
      createRecoveryKeyText
    );
    fireEvent.click(newAccountRecoveryKeyButton);
    expect(logViewEvent).toHaveBeenCalledWith(
      `flow.${viewName}`,
      'generate-new-key',
      REACT_ENTRYPOINT
    );
  });

  it('emits the expected metrics when a user continues to their account', async () => {
    render();
    const continueToAccountLink = await screen.findByText(
      continueToAccountText
    );
    fireEvent.click(continueToAccountLink);
    expect(logViewEvent).toHaveBeenCalledWith(
      `flow.${viewName}`,
      'continue-to-account',
      REACT_ENTRYPOINT
    );
    expect(
      GleanMetrics.passwordReset.recoveryKeyResetSuccessView
    ).toHaveBeenCalled();
  });
});
