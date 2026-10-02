/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { act, screen, waitFor } from '@testing-library/react';
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
  MOCK_CMS_INFO,
  MOCK_EMAIL,
  MOCK_SESSION_TOKEN,
  MOCK_UID,
  mockFinishOAuthFlowHandler,
} from '../../../mocks';
import { MozServices } from '../../../../lib/types';
import { OAuthNativeServices } from '@fxa/accounts/oauth';
import { AuthUiErrors } from '../../../../lib/auth-errors/auth-errors';
import VerificationMethods from '../../../../constants/verification-methods';
import VerificationReasons from '../../../../constants/verification-reasons';
import { getDefault, Config } from '../../../../lib/config';
import Storage from '../../../../lib/storage';
import { setCurrentAccountUid } from '../../../../lib/account-storage';

jest.mock('../../../../lib/storage-utils', () => ({
  storeAccountData: jest.fn(),
}));

jest.mock('../../../../lib/account-storage', () => ({
  ...jest.requireActual('../../../../lib/account-storage'),
  setCurrentAccountUid: jest.fn(),
}));

const mockNavigateWithQuery = jest.fn();
jest.mock('../../../../lib/hooks', () => ({
  ...jest.requireActual('../../../../lib/hooks'),
  useNavigateWithQuery: () => mockNavigateWithQuery,
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
    expect(screen.getByTestId('cached-signin-submit')).toHaveAttribute(
      'type',
      'submit'
    );
    screen.getByRole('link', { name: 'Use a different account' });
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Continue with Google/ })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Forgot password?' })
    ).not.toBeInTheDocument();
  });

  it('renders the CMS headline and primary button text when provided', () => {
    // Local fixture: MOCK_CMS_INFO deliberately omits SigninCachedPage so the
    // Signin suite can cover the fallback path.
    const cachedPageCms = {
      headline: 'CMS: Sign in to continue',
      description: 'CMS: with your saved account',
      primaryButtonText: 'CMS: Continue',
      pageTitle: 'CMS: Sign in to continue',
    };
    renderSigninCached({
      integration: createMockSigninWebIntegration({
        cmsInfo: { ...MOCK_CMS_INFO, SigninCachedPage: cachedPageCms },
      }),
    });

    expect(
      screen.getByRole('heading', { level: 1, name: cachedPageCms.headline })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: cachedPageCms.primaryButtonText })
    ).toBeInTheDocument();
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

  describe('account switcher', () => {
    const CACHED_UID = 'uid-cached';
    const OTHER_UID = 'uid-other';
    const OTHER_EMAIL = 'other@example.com';

    const storage = Storage.factory('localStorage');

    const configWithSwitcher = {
      ...getDefault(),
      featureFlags: {
        ...getDefault().featureFlags,
        accountSwitcherEnabled: true,
      },
    };

    const seedTwoAccounts = () => {
      storage.set('accounts', {
        [CACHED_UID]: {
          uid: CACHED_UID,
          email: MOCK_EMAIL,
          sessionToken: MOCK_SESSION_TOKEN,
        },
        [OTHER_UID]: {
          uid: OTHER_UID,
          email: OTHER_EMAIL,
          sessionToken: 'other-token',
        },
      });
      storage.set('currentAccountUid', CACHED_UID);
    };

    const renderWithConfig = (
      props: Partial<React.ComponentProps<typeof SigninCached>> = {},
      config: Config = configWithSwitcher
    ) =>
      renderWithLocalizationProvider(
        <MemoryRouter>
          <AppContext.Provider value={mockAppContext({ config })}>
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

    beforeEach(() => {
      storage.clear();
      mockNavigateWithQuery.mockClear();
    });

    afterEach(() => {
      storage.clear();
    });

    it('keeps the classic layout and plain link when the flag is off', () => {
      seedTwoAccounts();
      renderWithConfig({}, getDefault());

      expect(screen.queryByTestId('account-switcher')).not.toBeInTheDocument();
      screen.getByRole('link', { name: 'Use a different account' });
    });

    it('keeps the classic layout when no other account is stored', () => {
      storage.set('accounts', {
        [CACHED_UID]: {
          uid: CACHED_UID,
          email: MOCK_EMAIL,
          sessionToken: MOCK_SESSION_TOKEN,
        },
      });
      renderWithConfig();

      expect(screen.queryByTestId('account-switcher')).not.toBeInTheDocument();
      screen.getByRole('link', { name: 'Use a different account' });
    });

    it('replaces the lockup and button with a chooser', () => {
      seedTwoAccounts();
      renderWithConfig();

      expect(screen.getByTestId('account-switcher')).toBeInTheDocument();
      expect(screen.getByText(OTHER_EMAIL)).toBeInTheDocument();
      expect(
        screen.queryByRole('link', { name: 'Use a different account' })
      ).not.toBeInTheDocument();
      // The standalone Sign in button is gone; each row is the action.
      expect(
        screen.queryByRole('button', { name: 'Sign in' })
      ).not.toBeInTheDocument();
    });

    it('reframes the heading as a choice', () => {
      seedTwoAccounts();
      renderWithConfig();

      screen.getByRole('heading', { name: 'Choose an account' });
    });

    it('keeps the cached account as the submit control, even when another outranks it', () => {
      seedTwoAccounts();
      // The browser account normally outranks the current one, but the cached
      // row is the submit control, and functional tests click it by this id.
      renderWithConfig({ firefoxSignedInUid: OTHER_UID });

      const submit = screen.getByTestId('cached-signin-submit');
      expect(submit).toHaveAttribute('type', 'submit');
      expect(submit).toHaveTextContent(MOCK_EMAIL);
    });

    it('uses the freshly fetched avatar for the cached account row', () => {
      seedTwoAccounts();
      renderWithConfig();

      // MOCK_AVATAR_NON_DEFAULT comes from avatarData, not localStorage.
      expect(
        screen
          .getByTestId('cached-signin-submit')
          .querySelector('[data-testid="avatar-nondefault"]')
      ).toBeInTheDocument();
    });

    it('signs in as the cached account when its row is clicked', async () => {
      const user = userEvent.setup();
      const cachedSigninHandler = mockCachedSigninSuccess();
      seedTwoAccounts();
      renderWithConfig({ cachedSigninHandler });

      await user.click(screen.getByTestId('cached-signin-submit'));

      await waitFor(() => {
        expect(cachedSigninHandler).toHaveBeenCalledWith(MOCK_SESSION_TOKEN);
      });
      expect(setCurrentAccountUid).not.toHaveBeenCalled();
    });

    it('keeps the classic layout when CMS supplies the button copy', () => {
      seedTwoAccounts();
      renderWithConfig({
        integration: createMockSigninWebIntegration({
          cmsInfo: {
            ...MOCK_CMS_INFO,
            SigninCachedPage: {
              headline: 'Welcome back',
              description: 'Continue',
              primaryButtonText: 'Continue',
              pageTitle: 'Welcome back',
            },
          },
        }),
      });

      expect(screen.queryByTestId('account-switcher')).not.toBeInTheDocument();
      screen.getByRole('button', { name: 'Continue' });
    });

    it('starts the sign-in for the chosen account, not just a reorder', async () => {
      const user = userEvent.setup();
      seedTwoAccounts();
      renderWithConfig();

      await user.click(
        screen.getByTestId(`account-switcher-row-${OTHER_EMAIL}`)
      );

      expect(setCurrentAccountUid).toHaveBeenCalledWith(OTHER_UID);
      // autoSignIn is what makes the click a sign-in: the container re-resolves
      // this account's status, then submits on arrival.
      expect(mockNavigateWithQuery).toHaveBeenCalledWith(
        expect.stringContaining('/signin'),
        { state: { email: OTHER_EMAIL, autoSignIn: true } }
      );
    });

    it('does not set the current account for a session-less account', async () => {
      const user = userEvent.setup();
      storage.set('accounts', {
        [CACHED_UID]: {
          uid: CACHED_UID,
          email: MOCK_EMAIL,
          sessionToken: MOCK_SESSION_TOKEN,
        },
        [OTHER_UID]: { uid: OTHER_UID, email: OTHER_EMAIL },
      });
      storage.set('currentAccountUid', CACHED_UID);
      renderWithConfig();

      await user.click(
        screen.getByTestId(`account-switcher-row-${OTHER_EMAIL}`)
      );

      expect(setCurrentAccountUid).not.toHaveBeenCalled();
      expect(mockNavigateWithQuery).toHaveBeenCalledWith(
        expect.stringContaining('/signin'),
        { state: { email: OTHER_EMAIL, autoSignIn: true } }
      );
    });

    describe('autoSignIn', () => {
      it('shows a loading state instead of flashing the card', async () => {
        // Resolve on demand so the in-flight state can be observed.
        let release: (v: unknown) => void = () => {};
        const cachedSigninHandler = jest.fn().mockReturnValue(
          new Promise((r) => {
            release = r;
          })
        );
        seedTwoAccounts();
        renderWithConfig({ autoSignIn: true, cachedSigninHandler });

        await waitFor(() => {
          expect(cachedSigninHandler).toHaveBeenCalled();
        });
        expect(
          screen.queryByTestId('account-switcher')
        ).not.toBeInTheDocument();
        expect(
          screen.queryByTestId('cached-signin-submit')
        ).not.toBeInTheDocument();

        await act(async () => {
          release({ error: AuthUiErrors.UNEXPECTED_ERROR });
        });
      });

      it('reveals the card when the auto sign-in fails', async () => {
        const cachedSigninHandler = jest
          .fn()
          .mockResolvedValue({ error: AuthUiErrors.UNEXPECTED_ERROR });
        seedTwoAccounts();
        renderWithConfig({ autoSignIn: true, cachedSigninHandler });

        // Otherwise the user is stranded on a spinner with no way to retry.
        await waitFor(() => {
          expect(screen.getByTestId('account-switcher')).toBeInTheDocument();
        });
      });

      it('signs in on arrival, exactly once', async () => {
        const cachedSigninHandler = mockCachedSigninSuccess();
        seedTwoAccounts();
        renderWithConfig({ autoSignIn: true, cachedSigninHandler });

        await waitFor(() => {
          expect(cachedSigninHandler).toHaveBeenCalledWith(MOCK_SESSION_TOKEN);
        });
        await waitFor(() => {
          expect(handleNavigation).toHaveBeenCalled();
        });
        expect(cachedSigninHandler).toHaveBeenCalledTimes(1);
      });

      it('waits for a click when not set', async () => {
        const cachedSigninHandler = mockCachedSigninSuccess();
        seedTwoAccounts();
        renderWithConfig({ cachedSigninHandler });

        await waitFor(() => {
          expect(screen.getByTestId('account-switcher')).toBeInTheDocument();
        });
        expect(cachedSigninHandler).not.toHaveBeenCalled();
      });
    });

    it('sends "use another account" to email-first, prefilled', async () => {
      const user = userEvent.setup();
      seedTwoAccounts();
      renderWithConfig();

      await user.click(
        screen.getByTestId('account-switcher-use-another-account')
      );

      expect(mockNavigateWithQuery).toHaveBeenCalledWith(
        expect.stringMatching(/^\/\?/),
        {
          state: { prefillEmail: MOCK_EMAIL },
        }
      );
    });

    it('is hidden in a Firefox service flow, where Sync data cannot be merged', () => {
      seedTwoAccounts();
      renderWithConfig({
        integration: createMockSigninOAuthNativeIntegration({
          service: OAuthNativeServices.Relay,
        }),
        isSignedIntoFirefox: true,
      });

      expect(screen.queryByTestId('account-switcher')).not.toBeInTheDocument();
      expect(
        screen.queryByRole('link', { name: 'Use a different account' })
      ).not.toBeInTheDocument();
    });

    it('badges the account signed in to the browser', () => {
      seedTwoAccounts();
      renderWithConfig({ firefoxSignedInUid: OTHER_UID });

      expect(screen.getByText('Signed in to Firefox')).toBeInTheDocument();
    });
  });
});
