/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';

import SigninAlternativeAuthOptions from '.';
import GleanMetrics from '../../../../lib/glean';
import { AppContext } from '../../../../models';
import { mockAppContext } from '../../../../models/mocks';
import {
  createMockSigninOAuthNativeSyncIntegration,
  createMockSigninWebIntegration,
} from '../../mocks';
import {
  MOCK_AVATAR_NON_DEFAULT,
  MOCK_EMAIL,
  mockFinishOAuthFlowHandler,
} from '../../../mocks';
import { MozServices } from '../../../../lib/types';
import { isWebAuthnSupported } from '../../../../lib/passkeys/webauthn';

jest.mock('../../../../lib/passkeys/webauthn', () => ({
  ...jest.requireActual('../../../../lib/passkeys/webauthn'),
  isWebAuthnSupported: jest.fn(),
}));

jest.mock('../../../../lib/glean', () => ({
  __esModule: true,
  default: {
    login: {
      alternativeAuthView: jest.fn(),
      diffAccountLinkClick: jest.fn(),
    },
    passkey: {
      buttonView: jest.fn(),
      authSuccess: jest.fn(),
    },
  },
}));

const renderSigninAlternativeAuthOptions = (
  props: Partial<React.ComponentProps<typeof SigninAlternativeAuthOptions>> = {}
) =>
  renderWithLocalizationProvider(
    <MemoryRouter>
      <AppContext.Provider value={mockAppContext()}>
        <SigninAlternativeAuthOptions
          integration={createMockSigninWebIntegration()}
          email={MOCK_EMAIL}
          serviceName={MozServices.Default}
          hasLinkedAccount={true}
          hasPassword={false}
          avatarData={{ account: { avatar: MOCK_AVATAR_NON_DEFAULT } }}
          avatarLoading={false}
          finishOAuthFlowHandler={mockFinishOAuthFlowHandler}
          {...props}
        />
      </AppContext.Provider>
    </MemoryRouter>
  );

describe('SigninAlternativeAuthOptions', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the third-party signin UI without password input or cached sign-in button', () => {
    renderSigninAlternativeAuthOptions();

    screen.getByRole('heading', { name: 'Sign in' });
    screen.getByText(MOCK_EMAIL);
    screen.getByRole('button', { name: /Continue with Google/ });
    screen.getByRole('button', { name: /Continue with Apple/ });
    screen.getByRole('link', { name: /Terms of Service/ });
    screen.getByRole('link', { name: /Privacy Notice/ });
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Sign in' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Forgot password?' })
    ).not.toBeInTheDocument();
  });

  it('renders third-party auth options for Sync linked-passwordless users', () => {
    renderSigninAlternativeAuthOptions({
      integration: createMockSigninOAuthNativeSyncIntegration(),
    });

    screen.getByRole('button', { name: /Continue with Google/ });
    screen.getByRole('button', { name: /Continue with Apple/ });
  });

  it('emits login.alternativeAuthView on mount', () => {
    renderSigninAlternativeAuthOptions();
    expect(GleanMetrics.login.alternativeAuthView).toHaveBeenCalledTimes(1);
  });

  describe('passkey signin CTA gating', () => {
    beforeEach(() => {
      (isWebAuthnSupported as jest.Mock).mockReturnValue(true);
    });

    const renderWithPasskeyFlags = (
      props: Partial<
        React.ComponentProps<typeof SigninAlternativeAuthOptions>
      > = {}
    ) => {
      const context = mockAppContext();
      if (context.config) {
        context.config.featureFlags = {
          ...context.config.featureFlags,
          passkeysEnabled: true,
          passkeyAuthenticationEnabled: true,
        };
      }
      renderWithLocalizationProvider(
        <MemoryRouter>
          <AppContext.Provider value={context}>
            <SigninAlternativeAuthOptions
              integration={createMockSigninWebIntegration()}
              email={MOCK_EMAIL}
              serviceName={MozServices.Default}
              hasLinkedAccount={true}
              hasPassword={false}
              avatarData={{ account: { avatar: MOCK_AVATAR_NON_DEFAULT } }}
              avatarLoading={false}
              finishOAuthFlowHandler={mockFinishOAuthFlowHandler}
              {...props}
            />
          </AppContext.Provider>
        </MemoryRouter>
      );
    };
    const passkeyButton = () =>
      screen.queryByRole('button', { name: 'Sign in with passkey' });

    it('renders the passkey CTA when hasPasskey is true', () => {
      renderWithPasskeyFlags({ hasPasskey: true });
      expect(passkeyButton()).toBeInTheDocument();
    });

    it('hides the passkey CTA when hasPasskey is undefined (fails closed)', () => {
      renderWithPasskeyFlags({ hasPasskey: undefined });
      expect(passkeyButton()).not.toBeInTheDocument();
    });

    it('hides the passkey CTA when WebAuthn is unsupported', () => {
      (isWebAuthnSupported as jest.Mock).mockReturnValue(false);
      renderWithPasskeyFlags({ hasPasskey: true });
      expect(passkeyButton()).not.toBeInTheDocument();
    });

    it('emits passkey.buttonView for the alternative_auth surface when the CTA renders', () => {
      renderWithPasskeyFlags({ hasPasskey: true });
      expect(GleanMetrics.passkey.buttonView).toHaveBeenCalledTimes(1);
      expect(GleanMetrics.passkey.buttonView).toHaveBeenCalledWith({
        event: { reason: 'alternative_auth' },
      });
    });

    it('does not emit passkey.buttonView when the CTA is hidden', () => {
      renderWithPasskeyFlags({ hasPasskey: undefined });
      expect(GleanMetrics.passkey.buttonView).not.toHaveBeenCalled();
    });
  });
});
