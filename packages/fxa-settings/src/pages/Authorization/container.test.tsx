/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { screen, waitFor } from '@testing-library/react';
import AuthorizationContainer from './container';
import { OAUTH_ERRORS } from '../../lib/oauth/oauth-errors';
import { Integration } from '../../models';
import AuthClient from 'fxa-auth-client/browser';
import VerificationMethods from '../../constants/verification-methods';
import VerificationReasons from '../../constants/verification-reasons';

// Mocked Modules
import * as CacheModule from '../../lib/cache';
import * as SigninUtilsModule from '../Signin/utils';
import * as ModelsModule from '../../models';
import * as ReactUtilsModule from 'fxa-react/lib/utils';
import * as OAuthHooksModule from '../../lib/oauth/hooks';
import * as HooksModule from '../../lib/hooks/useNavigateWithQuery';
import * as ReachRouterModule from '@reach/router';
import * as ModelsHooksModule from '../../models/hooks';
import * as OAuthWebIntegrationModule from '../../models/integrations/oauth-web-integration';

describe('AuthorizationContainer', () => {
  const mockAccount = {
    uid: 'uid-123',
    email: 'foo@mozilla.com',
    sessionToken: 'session-123',
  };

  function render(integration: unknown) {
    return renderWithLocalizationProvider(
      <AuthorizationContainer integration={integration as Integration} />
    );
  }

  const mockAuthClient = {
    verifyIdToken: jest.fn(),
  } as unknown as AuthClient;

  const mockSession = {
    sendVerificationCode: jest.fn().mockResolvedValue(undefined),
    validatePromptNoneRequest: jest.fn().mockResolvedValue(undefined),
  } as unknown as ModelsModule.Session;

  const mockLocation = {
    search: '',
  } as unknown as ReachRouterModule.WindowLocation<unknown>;

  const mockUseLocation = jest.spyOn(ReachRouterModule, 'useLocation');
  const mockUseSession = jest.spyOn(ModelsHooksModule, 'useSession');
  const mockUseAuthClient = jest.spyOn(ModelsHooksModule, 'useAuthClient');
  const mockIsOauthWebIntegration = jest.spyOn(
    OAuthWebIntegrationModule,
    'isOAuthWebIntegration'
  );
  const mockCurrentAccount = jest.spyOn(CacheModule, 'currentAccount');
  const mockUseFinishOAuthFlowHandler = jest.spyOn(
    OAuthHooksModule,
    'useFinishOAuthFlowHandler'
  );
  const mockCachedSignIn = jest.spyOn(SigninUtilsModule, 'cachedSignIn');
  const mockHandleNavigation = jest.spyOn(
    SigninUtilsModule,
    'handleNavigation'
  );
  const mockHardNavigate = jest.spyOn(ReactUtilsModule, 'hardNavigate');
  const mockNavigateWithQuery = jest.fn();
  const mockUseNavigateWithQuery = jest.spyOn(
    HooksModule,
    'useNavigateWithQuery'
  );

  beforeEach(() => {
    jest.resetAllMocks();
    mockLocation.search = '';
    mockUseLocation.mockReturnValue(mockLocation);
    mockUseAuthClient.mockReturnValue(mockAuthClient);
    mockUseSession.mockReturnValue(mockSession);
    mockIsOauthWebIntegration.mockReturnValue(true);
    mockCurrentAccount.mockReturnValue(mockAccount);
    mockUseFinishOAuthFlowHandler.mockReturnValue({
      finishOAuthFlowHandler: jest.fn(),
      oAuthDataError: null,
    });
    mockCachedSignIn.mockResolvedValue({
      data: {
        verificationMethod: VerificationMethods.EMAIL_OTP,
        verificationReason: VerificationReasons.SIGN_IN,
        uid: mockAccount.uid,
        sessionVerified: true,
        emailVerified: true,
      },
      error: undefined,
    });
    mockHandleNavigation.mockResolvedValue({ error: undefined });
    mockHardNavigate.mockImplementation(() => {});
    mockNavigateWithQuery.mockImplementation(() => {});
    mockUseNavigateWithQuery.mockImplementation(() => mockNavigateWithQuery);
  });

  it('renders OAuthDataError when finish oauth handler returns an error', async () => {
    mockUseFinishOAuthFlowHandler.mockReturnValue({
      finishOAuthFlowHandler: jest.fn(),
      oAuthDataError: { errno: 999, message: 'oops' },
    });

    const mockIntegration = {
      data: {},
      wantsPromptNone: jest.fn(),
    };

    render(mockIntegration);

    expect(await screen.findByText('Bad Request')).toBeInTheDocument();
  });

  it('handles prompt=none case', async () => {
    mockIsOauthWebIntegration.mockReturnValue(true);

    const mockIntegration = {
      data: {
        redirectTo: '/settings',
      },
      wantsPromptNone: jest.fn().mockReturnValue(true),
      returnOnError: jest.fn().mockReturnValue(false),
      validatePromptNoneRequest: jest.fn().mockResolvedValue(undefined),
    };

    render(mockIntegration);

    await waitFor(() => {
      expect(SigninUtilsModule.handleNavigation).toHaveBeenCalledTimes(1);
    });

    expect(mockIntegration.validatePromptNoneRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        uid: mockAccount.uid,
        email: mockAccount.email,
        sessionToken: mockAccount.sessionToken,
        verifyIdToken: expect.any(Function),
        isDefault: expect.any(Function),
      })
    );

    expect(screen.queryByText('Bad Request')).not.toBeInTheDocument();
  });

  it('redirects with hardNavigate when returnOnError=true and unexpected error occurs', async () => {
    mockCachedSignIn.mockResolvedValue({
      error: new Error('BOOM'),
    });

    const mockIntegration = {
      data: {
        redirectTo: '/settings',
      },
      wantsPromptNone: jest.fn().mockReturnValue(true),
      returnOnError: jest.fn().mockReturnValue(true),
      getRedirectWithErrorUrl: jest
        .fn()
        .mockReturnValue('https://mozilla.com/error'),
      validatePromptNoneRequest: jest.fn().mockResolvedValue(undefined),
    };

    render(mockIntegration);

    await waitFor(() => {
      expect(ReactUtilsModule.hardNavigate).toHaveBeenCalledWith(
        'https://mozilla.com/error'
      );
    });
  });

  it('navigates to /oauth if cached signed in returns PROMPT_NONE_NOT_SIGNED_IN error', async () => {
    mockCachedSignIn.mockResolvedValue({
      error: OAUTH_ERRORS.PROMPT_NONE_NOT_SIGNED_IN,
    });

    const mockIntegration = {
      data: {
        redirectTo: '/settings',
      },
      wantsPromptNone: jest.fn().mockReturnValue(true),
      validatePromptNoneRequest: jest.fn().mockResolvedValue(undefined),
      returnOnError: jest.fn().mockReturnValue(false),
    };

    render(mockIntegration);

    await waitFor(() => {
      expect(mockNavigateWithQuery).toHaveBeenCalledWith('/oauth');
    });
  });

  it('navigates to /oauth when action=email', async () => {
    mockLocation.search = '?foo=1&showReactApp=1';
    const mockIntegration = {
      data: {
        redirectTo: '/settings',
        action: 'email',
      },
      wantsPromptNone: jest.fn().mockReturnValue(false),
      validatePromptNoneRequest: jest.fn().mockResolvedValue(undefined),
    };

    render(mockIntegration);

    await waitFor(() => {
      expect(mockNavigateWithQuery).toHaveBeenCalledWith('/oauth');
    });
  });

  it('navigates to /signin when action is signin', async () => {
    mockLocation.search = '?x=1&showReactApp=1';
    const mockIntegration = {
      data: {
        action: 'signin',
      },
      wantsPromptNone: jest.fn().mockReturnValue(false),
    };

    render(mockIntegration);

    await waitFor(() => {
      expect(ReactUtilsModule.hardNavigate).toHaveBeenCalledWith('/signin?x=1');
    });
  });

  it("navigates to '/oauth' when no action is provided and not prompt=none", async () => {
    const mockOAuthWebIntegration = {
      data: {
        action: undefined,
      },
      wantsPromptNone: jest.fn().mockReturnValue(false),
    };

    render(mockOAuthWebIntegration);

    await waitFor(() => {
      expect(mockNavigateWithQuery).toHaveBeenCalledWith('/oauth');
    });
  });
});
