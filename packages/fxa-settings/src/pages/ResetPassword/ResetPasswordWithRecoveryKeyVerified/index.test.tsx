/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
// import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';
import ResetPasswordWithRecoveryKeyVerified, { viewName } from '.';
import { logViewEvent } from '../../../lib/metrics';
import { REACT_ENTRYPOINT } from '../../../constants';
import {
  createAppContext,
  createHistoryWithQuery,
  renderWithRouter,
} from '../../../models/mocks';

jest.mock('../../../lib/metrics', () => ({
  logViewEvent: jest.fn(),
  usePageViewEvent: jest.fn(),
}));

let mockIsSync = false;
let mockServiceName = 'account settings';
jest.mock('../../../models/hooks.ts', () => {
  return {
    __esModule: true,
    ...jest.requireActual('../../../models/hooks.ts'),
    useRelier: () => ({
      isSync: () => mockIsSync,
      getServiceName: () => mockServiceName,
    }),
  };
});

beforeEach(() => {
  mockIsSync = false;
  mockServiceName = 'account settings';
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('ResetPasswordWithRecoveryKeyVerified', () => {
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });

  const route = '/reset_password_with_recovery_key_verified';

  const startBrowsingText = 'Start browsing';
  const signedInText = 'You’re now ready to use account settings';
  const singedOutText = 'Your account is ready!';
  const syncText =
    'Complete setup by entering your new password on your other Firefox devices.';
  const createRecoveryKeyText = 'Generate a new account recovery key';
  const continueToAccountText = 'Continue to my account';

  const render = (ui: any, queryParams = '') => {
    const history = createHistoryWithQuery(route, queryParams);
    const appCtx = createAppContext(history);
    const result = renderWithRouter(
      ui,
      {
        route,
        history,
      },
      appCtx
    );
    return result;
  };

  it('renders default content', async () => {
    render(<ResetPasswordWithRecoveryKeyVerified isSignedIn={true} />);
    // testAllL10n(screen, bundle);
    await screen.findByText(signedInText);
    screen.getByText(createRecoveryKeyText);
    screen.getByText(continueToAccountText);
  });

  it('renders default content when signed out', async () => {
    render(<ResetPasswordWithRecoveryKeyVerified isSignedIn={false} />);
    await screen.findByText(singedOutText);
    screen.getByText(createRecoveryKeyText);
    screen.getByText(continueToAccountText);
  });

  it('renders default content for sync service', async () => {
    mockIsSync = true;
    render(
      <ResetPasswordWithRecoveryKeyVerified isSignedIn={false} />,
      'service=sync'
    );
    await screen.findByText(syncText);
    screen.getByText(startBrowsingText);
    screen.getByText(createRecoveryKeyText);
    screen.getByText(continueToAccountText);
  });

  it('emits the expected metrics when a user generates new recovery keys', async () => {
    render(<ResetPasswordWithRecoveryKeyVerified isSignedIn={true} />);
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
    render(<ResetPasswordWithRecoveryKeyVerified isSignedIn={true} />);
    const continueToAccountLink = await screen.findByText(
      continueToAccountText
    );
    fireEvent.click(continueToAccountLink);
    expect(logViewEvent).toHaveBeenCalledWith(
      `flow.${viewName}`,
      'continue-to-account',
      REACT_ENTRYPOINT
    );
  });
});
