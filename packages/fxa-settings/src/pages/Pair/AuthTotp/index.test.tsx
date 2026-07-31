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
import { MOCK_AUTHORITY_ACCOUNT } from '../mocks';
import { MozServices } from '../../../lib/types';
import { REACT_ENTRYPOINT } from '../../../constants';
import { AppContext } from '../../../models/contexts/AppContext';
import { firefox } from '../../../lib/channels/firefox';
import {
  isPairingTotpVerified,
  resetPairingTotpVerified,
} from '../../../lib/pairing-authority';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
}));

const mockNavigateWithQuery = jest.fn();
jest.mock('../../../lib/hooks/useNavigateWithQuery', () => ({
  useNavigateWithQuery: () => mockNavigateWithQuery,
}));

// The code is checked against the browser's session, not web storage.
jest.mock('../../../lib/channels/firefox', () => ({
  firefox: {
    requestSignedInUser: jest.fn(),
  },
}));
const mockRequestSignedInUser = firefox.requestSignedInUser as jest.Mock;

const MOCK_CHANNEL_ID = '1c2d3e4f5a6b7c8d';
const MOCK_CODE = '123456';

// Helper to render with AppContext that includes authClient
function renderWithAppContext(
  ui: React.ReactElement,
  authClientOverrides: Partial<{ verifyTotpCode: jest.Mock }> = {}
) {
  const appCtx = mockAppContext();
  if (appCtx.authClient) {
    Object.assign(appCtx.authClient as object, {
      verifyTotpCode: jest.fn().mockResolvedValue({ success: true }),
      ...authClientOverrides,
    });
  }
  return {
    ...renderWithLocalizationProvider(
      <AppContext.Provider value={appCtx}>{ui}</AppContext.Provider>
    ),
    verifyTotpCode: (
      appCtx.authClient as unknown as {
        verifyTotpCode: jest.Mock;
      }
    ).verifyTotpCode,
  };
}

async function submitCode(code = MOCK_CODE) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Enter 6-digit code'), code);
  await user.click(screen.getByRole('button', { name: 'Confirm' }));
}

describe('Sign in with TOTP code page', () => {
  // TODO: enable l10n tests when they've been updated to handle embedded tags in ftl strings
  // TODO: in FXA-6461
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });

  beforeEach(() => {
    jest.clearAllMocks();
    resetPairingTotpVerified();
    mockRequestSignedInUser.mockResolvedValue(MOCK_AUTHORITY_ACCOUNT);
    window.history.pushState(
      {},
      '',
      `/pair/auth/totp?channel_id=${MOCK_CHANNEL_ID}`
    );
  });

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

  it('emits a metrics event on render', () => {
    renderWithAppContext(<AuthTotp email={MOCK_ACCOUNT.primaryEmail.email} />);
    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
  });

  describe('on submit', () => {
    it('verifies the code against the session the browser will pair with', async () => {
      const { verifyTotpCode } = renderWithAppContext(
        <AuthTotp email={MOCK_ACCOUNT.primaryEmail.email} />
      );

      await submitCode();

      await waitFor(() => {
        expect(verifyTotpCode).toHaveBeenCalledWith(
          MOCK_AUTHORITY_ACCOUNT.sessionToken,
          MOCK_CODE,
          { service: 'pair' }
        );
      });
    });

    it('records the verification for this pairing channel and returns to the approval page', async () => {
      renderWithAppContext(
        <AuthTotp email={MOCK_ACCOUNT.primaryEmail.email} />
      );

      await submitCode();

      await waitFor(() => {
        expect(mockNavigateWithQuery).toHaveBeenCalledWith('/pair/auth/allow');
      });
      expect(isPairingTotpVerified(MOCK_CHANNEL_ID)).toBe(true);
    });

    it('calls onVerified instead of navigating when it is provided', async () => {
      const onVerified = jest.fn();
      renderWithAppContext(
        <AuthTotp email={MOCK_ACCOUNT.primaryEmail.email} {...{ onVerified }} />
      );

      await submitCode();

      await waitFor(() => {
        expect(onVerified).toHaveBeenCalled();
      });
      expect(mockNavigateWithQuery).not.toHaveBeenCalled();
    });

    it('shows an error and records nothing when the code is rejected', async () => {
      renderWithAppContext(
        <AuthTotp email={MOCK_ACCOUNT.primaryEmail.email} />,
        { verifyTotpCode: jest.fn().mockResolvedValue({ success: false }) }
      );

      await submitCode();

      expect(
        await screen.findByText('Invalid authentication code')
      ).toBeInTheDocument();
      expect(isPairingTotpVerified(MOCK_CHANNEL_ID)).toBe(false);
      expect(mockNavigateWithQuery).not.toHaveBeenCalled();
    });

    it('shows an error and records nothing when verification throws', async () => {
      renderWithAppContext(
        <AuthTotp email={MOCK_ACCOUNT.primaryEmail.email} />,
        {
          verifyTotpCode: jest
            .fn()
            .mockRejectedValue(new Error('Unexpected error')),
        }
      );

      await submitCode();

      expect(await screen.findByText('Unexpected error')).toBeInTheDocument();
      expect(isPairingTotpVerified(MOCK_CHANNEL_ID)).toBe(false);
    });

    it('cancels pairing when the browser reports no signed-in account', async () => {
      mockRequestSignedInUser.mockResolvedValue(undefined);
      const { verifyTotpCode } = renderWithAppContext(
        <AuthTotp email={MOCK_ACCOUNT.primaryEmail.email} />
      );

      await submitCode();

      await waitFor(() => {
        expect(mockNavigateWithQuery).toHaveBeenCalledWith('/pair/failure');
      });
      expect(verifyTotpCode).not.toHaveBeenCalled();
      expect(isPairingTotpVerified(MOCK_CHANNEL_ID)).toBe(false);
    });
  });
});
