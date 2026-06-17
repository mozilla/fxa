/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';

import SigninCached from '.';
import { AppContext } from '../../../../models';
import { mockAppContext } from '../../../../models/mocks';
import {
  createMockSigninWebIntegration,
  createMockSigninOAuthNativeIntegration,
} from '../../mocks';
import { handleNavigation } from '../../utils';
import {
  MOCK_AVATAR_NON_DEFAULT,
  MOCK_EMAIL,
  MOCK_SESSION_TOKEN,
  MOCK_UID,
  mockFinishOAuthFlowHandler,
} from '../../../mocks';
import { MozServices } from '../../../../lib/types';
import { OAuthNativeServices } from '@fxa/accounts/oauth';
import VerificationMethods from '../../../../constants/verification-methods';
import VerificationReasons from '../../../../constants/verification-reasons';

jest.mock('../../../../lib/storage-utils', () => ({
  storeAccountData: jest.fn(),
}));

jest.mock('../../utils', () => ({
  __esModule: true,
  ...jest.requireActual('../../utils'),
  handleNavigation: jest.fn().mockResolvedValue({ error: undefined }),
  ensureCanLinkAcountOrRedirect: jest.fn().mockResolvedValue(true),
}));

const mockCachedSigninSuccess = () =>
  jest.fn().mockResolvedValue({
    data: {
      uid: MOCK_UID,
      emailVerified: true,
      sessionVerified: true,
      verificationMethod: VerificationMethods.EMAIL,
      verificationReason: VerificationReasons.SIGN_IN,
      totpIsActive: false,
    },
  });

const renderSigninCached = (
  props: Partial<React.ComponentProps<typeof SigninCached>> = {}
) =>
  renderWithLocalizationProvider(
    <MemoryRouter>
      <AppContext.Provider value={mockAppContext()}>
        <SigninCached
          integration={createMockSigninWebIntegration()}
          email={MOCK_EMAIL}
          sessionToken={MOCK_SESSION_TOKEN}
          serviceName={MozServices.Default}
          hasLinkedAccount={false}
          hasPassword={true}
          avatarData={{ account: { avatar: MOCK_AVATAR_NON_DEFAULT } }}
          avatarLoading={false}
          cachedSigninHandler={jest.fn()}
          finishOAuthFlowHandler={mockFinishOAuthFlowHandler}
          onSessionExpired={jest.fn()}
          {...props}
        />
      </AppContext.Provider>
    </MemoryRouter>
  );

describe('SigninCached', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the cached signin UI without password input or third-party auth', () => {
    renderSigninCached();

    screen.getByRole('heading', { name: 'Sign in' });
    screen.getByAltText('Your avatar');
    screen.getByText(MOCK_EMAIL);
    screen.getByRole('button', { name: 'Sign in' });
    screen.getByRole('link', { name: 'Use a different account' });
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Continue with Google/ })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Forgot password?' })
    ).not.toBeInTheDocument();
  });

  it('renders the same cached UI for passwordless users (hasPassword=false)', () => {
    renderSigninCached({ hasPassword: false, hasLinkedAccount: true });

    screen.getByRole('heading', { name: 'Sign in' });
    screen.getByRole('button', { name: 'Sign in' });
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();
  });

  it('hides "Use a different account" link when signed into Firefox with a service', () => {
    const integration = createMockSigninWebIntegration();
    integration.isFirefoxClient = () => true;
    integration.getService = () => MozServices.FirefoxSync;
    renderSigninCached({ integration, isSignedIntoFirefox: true });

    expect(
      screen.queryByRole('link', { name: 'Use a different account' })
    ).not.toBeInTheDocument();
  });

  describe('on submit', () => {
    // "keys not optional" = Firefox where Sync isn't decoupled: desktop
    // before 147, and Mobile as of Firefox 153.
    it('defers web channel messages and routes a passwordless VPN sign-in to set_password when keys are not optional', async () => {
      const user = userEvent.setup();
      renderSigninCached({
        integration: createMockSigninOAuthNativeIntegration({
          service: OAuthNativeServices.Vpn,
          isSync: false,
        }),
        hasPassword: false,
        hasLinkedAccount: true,
        supportsKeysOptionalLogin: false,
        cachedSigninHandler: mockCachedSigninSuccess(),
      });

      await user.click(screen.getByRole('button', { name: 'Sign in' }));

      await waitFor(() => {
        expect(handleNavigation).toHaveBeenCalledWith(
          expect.objectContaining({
            isSignInWithThirdPartyAuth: true,
            handleFxaLogin: false,
            handleFxaOAuthLogin: false,
            supportsKeysOptionalLogin: false,
          })
        );
      });
    });

    it('signs in immediately for a passwordless VPN sign-in when the browser supports keys-optional login', async () => {
      const user = userEvent.setup();
      renderSigninCached({
        integration: createMockSigninOAuthNativeIntegration({
          service: OAuthNativeServices.Vpn,
          isSync: false,
        }),
        hasPassword: false,
        hasLinkedAccount: true,
        supportsKeysOptionalLogin: true,
        cachedSigninHandler: mockCachedSigninSuccess(),
      });

      await user.click(screen.getByRole('button', { name: 'Sign in' }));

      await waitFor(() => {
        expect(handleNavigation).toHaveBeenCalledWith(
          expect.objectContaining({
            isSignInWithThirdPartyAuth: false,
            handleFxaLogin: true,
            handleFxaOAuthLogin: true,
            supportsKeysOptionalLogin: true,
          })
        );
      });
    });

    it('signs in immediately for a VPN authorization when the user already has a password (does not defer to set_password)', async () => {
      const user = userEvent.setup();
      renderSigninCached({
        integration: createMockSigninOAuthNativeIntegration({
          service: OAuthNativeServices.Vpn,
          isSync: false,
        }),
        hasPassword: true,
        isSignedIntoFirefox: true,
        supportsKeysOptionalLogin: false,
        cachedSigninHandler: mockCachedSigninSuccess(),
      });

      await user.click(screen.getByRole('button', { name: 'Sign in' }));

      await waitFor(() => {
        expect(handleNavigation).toHaveBeenCalledWith(
          expect.objectContaining({
            isSignInWithThirdPartyAuth: false,
            handleFxaLogin: true,
            handleFxaOAuthLogin: true,
          })
        );
      });
    });
  });
});
