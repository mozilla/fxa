/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import ResetPasswordWithRecoveryKeyVerified, { viewName } from '.';
import { logViewEvent } from '../../../lib/metrics';
import { REACT_ENTRYPOINT } from '../../../constants';
import {
  createHistoryWithQuery,
  renderWithRouter,
} from '../../../models/mocks';
import GleanMetrics from '../../../lib/glean';
import userEvent from '@testing-library/user-event';

jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useLocation: jest
    .fn()
    .mockReturnValue({ state: { email: 'testo@example.gg' } }),
}));
jest.mock('../../../models', () => ({
  ...jest.requireActual('../../../models'),
  useAuthClient: jest.fn(),
  useSensitiveDataClient: jest.fn().mockReturnValue({
    getData: jest.fn().mockReturnValue({ buffer: '' }),
    setData: jest.fn(),
  }),
}));

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

jest.mock('../../../lib/utilities', () => ({
  ...jest.requireActual('../../../lib/utilities'),
  formatRecoveryKey: jest.fn(),
}));

afterEach(() => {
  jest.clearAllMocks();
});

const route = 'reset_password_with_recovery_key_verified';
const render = (ui: any) => {
  const history = createHistoryWithQuery(route);
  const result = renderWithRouter(ui, {
    route,
    history,
  });
  return result;
};

const defaultProps = {
  email: 'testo@example.gg',
  newRecoveryKey: '90019001900190019001900190019001',
  showHint: false,
  oAuthError: undefined,
  navigateToHint: () => {},
  updateRecoveryKeyHint: () => Promise.resolve(),
  navigateNext: () => Promise.resolve(),
};

describe('ResetPasswordWithRecoveryKeyVerified', () => {
  it('renders default content', async () => {
    render(<ResetPasswordWithRecoveryKeyVerified {...defaultProps} />);
    await screen.findByText(
      'New account recovery key created. Download and store it now.'
    );
  });

  it('emits the expected metrics when a user generates new recovery keys', async () => {
    render(<ResetPasswordWithRecoveryKeyVerified {...defaultProps} />);
    await waitFor(() => {
      expect(logViewEvent).toHaveBeenCalledWith(
        `flow.${viewName}`,
        'generate-new-key',
        REACT_ENTRYPOINT
      );
    });
  });

  it('emits the expected metrics when a user continues to their account', async () => {
    const props = {
      ...defaultProps,
      showHint: true,
      navigateNext: async (x: () => void) => x(),
    };
    render(<ResetPasswordWithRecoveryKeyVerified {...props} />);
    await userEvent.click(screen.getByRole('button', { name: 'Finish' }));
    await waitFor(() => {
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
});
