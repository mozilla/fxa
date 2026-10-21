/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider'; // import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';
import { usePageViewEvent } from '../../../lib/metrics';
import AuthTotp, { viewName } from '.';
import { MOCK_ACCOUNT, mockAppContext } from '../../../models/mocks';
import { MozServices } from '../../../lib/types';
import { REACT_ENTRYPOINT } from '../../../constants';
import { AppContext } from '../../../models/contexts/AppContext';
import AuthClient from 'fxa-auth-client/browser';
import { mockUseFxAStatus } from '../../../lib/hooks/useFxAStatus/mocks';
import { recordTotpVerified } from '../../../lib/account-storage';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('../../../lib/hooks/useNavigateWithQuery', () => ({
  useNavigateWithQuery: () => mockNavigate,
}));

let mockLocationState: unknown = null;
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useLocation: () => ({ state: mockLocationState }),
}));

jest.mock('../../../lib/account-storage', () => ({
  getBasicAccountData: () => ({
    uid: 'uid-123',
    sessionToken: 'session-token',
  }),
  recordTotpVerified: jest.fn(),
}));

// Helper to render with AppContext that includes authClient
function renderWithAppContext(
  ui: React.ReactElement,
  appCtx = mockAppContext()
) {
  return renderWithLocalizationProvider(
    <AppContext.Provider value={appCtx}>{ui}</AppContext.Provider>
  );
}

describe('Sign in with TOTP code page', () => {
  // TODO: enable l10n tests when they've been updated to handle embedded tags in ftl strings
  // TODO: in FXA-6461
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });

  it('renders as expected', () => {
    renderWithAppContext(<AuthTotp email={MOCK_ACCOUNT.primaryEmail.email} />);
    // testAllL10n(screen, bundle);

    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent(
      'Enter authentication code to continue to account settings'
    );
    screen.getByLabelText('Enter 6-digit code');

    screen.getByRole('button', { name: 'Confirm' });
    // Yes, this is a clone of SigninTotpCode, but it signficantly does not have these elements!
    expect(
      screen.queryByRole('link', { name: 'Use a different account' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Trouble entering code?' })
    ).not.toBeInTheDocument();
  });

  it('shows the relying party in the header when a service name is provided', () => {
    renderWithAppContext(
      <AuthTotp
        email={MOCK_ACCOUNT.primaryEmail.email}
        serviceName={MozServices.MozillaVPN}
      />
    );
    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent(
      'Enter authentication code to continue to Mozilla VPN'
    );
  });

  describe('after a valid code', () => {
    afterEach(() => {
      mockNavigate.mockReset();
      mockLocationState = null;
    });

    async function submitValidCode() {
      const authClient = {
        verifyTotpCode: jest.fn().mockResolvedValue({ success: true }),
      } as unknown as AuthClient;
      renderWithAppContext(
        <AuthTotp email={MOCK_ACCOUNT.primaryEmail.email} />,
        mockAppContext({ authClient })
      );
      const user = userEvent.setup();
      await user.type(screen.getByLabelText('Enter 6-digit code'), '123456');
      await user.click(screen.getByRole('button', { name: 'Confirm' }));
      await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
    }

    it('returns to /pair when /pair sent the user here', async () => {
      mockLocationState = { returnToPair: true };
      await submitValidCode();
      expect(mockNavigate).toHaveBeenCalledWith('/pair', {
        state: { totpComplete: true },
      });
    });

    it('goes to /pair/auth/allow by default', async () => {
      await submitValidCode();
      expect(mockNavigate).toHaveBeenCalledWith('/pair/auth/allow', {
        state: { totpComplete: true },
      });
    });

    it('verifies the code for the Firefox Sync account, not the current local account', async () => {
      const verifyTotpCode = jest.fn().mockResolvedValue({ success: true });
      renderWithAppContext(
        <AuthTotp
          email={MOCK_ACCOUNT.primaryEmail.email}
          fxaStatusResult={mockUseFxAStatus({
            signedInUser: {
              uid: 'sync-uid',
              email: 'sync@example.com',
              sessionToken: 'sync-token',
              verified: true,
            },
          })}
        />,
        mockAppContext({
          authClient: { verifyTotpCode } as unknown as AuthClient,
        })
      );
      const user = userEvent.setup();
      await user.type(screen.getByLabelText('Enter 6-digit code'), '123456');
      await user.click(screen.getByRole('button', { name: 'Confirm' }));

      await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
      expect(verifyTotpCode).toHaveBeenCalledWith('sync-token', '123456', {
        service: 'pair',
      });
      expect(recordTotpVerified).toHaveBeenCalledWith('sync-uid');
    });
  });

  it('waits for fxa_status before it shows the code form', () => {
    renderWithAppContext(
      <AuthTotp
        email={MOCK_ACCOUNT.primaryEmail.email}
        fxaStatusResult={mockUseFxAStatus({ fxaStatusState: 'pending' })}
      />
    );
    expect(
      screen.queryByLabelText('Enter 6-digit code')
    ).not.toBeInTheDocument();
  });

  it('emits a metrics event on render', () => {
    renderWithAppContext(<AuthTotp email={MOCK_ACCOUNT.primaryEmail.email} />);
    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
  });
});
