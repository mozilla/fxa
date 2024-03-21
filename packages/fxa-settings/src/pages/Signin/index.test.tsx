/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import GleanMetrics from '../../lib/glean';
import {
  CACHED_SIGNIN_HANDLER_RESPONSE,
  createBeginSigninResponse,
  createBeginSigninResponseError,
  createCachedSigninResponseError,
  createMockSigninOAuthIntegration,
  Subject,
} from './mocks';
import {
  MOCK_EMAIL,
  MOCK_KEY_FETCH_TOKEN,
  MOCK_OAUTH_FLOW_HANDLER_RESPONSE,
  MOCK_PASSWORD,
  MOCK_SESSION_TOKEN,
  MOCK_UID,
  MOCK_UNWRAP_BKEY,
} from '../mocks';
import { MozServices } from '../../lib/types';
import * as utils from 'fxa-react/lib/utils';
import { storeAccountData } from '../../lib/storage-utils';
import VerificationMethods from '../../constants/verification-methods';
import VerificationReasons from '../../constants/verification-reasons';
import { SigninProps } from './interfaces';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import {
  MONITOR_CLIENTIDS,
  POCKET_CLIENTIDS,
} from '../../models/integrations/client-matching';
// import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';
jest.mock('../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
  logViewEventOnce: jest.fn(),
  useMetrics: () => ({
    usePageViewEvent: jest.fn(),
    logViewEvent: jest.fn(),
    logViewEventOnce: jest.fn(),
  }),
}));
jest.mock('../../lib/glean', () => ({
  __esModule: true,
  default: {
    login: {
      forgotPassword: jest.fn(),
      view: jest.fn(),
      submit: jest.fn(),
      success: jest.fn(),
      error: jest.fn(),
    },
    cachedLogin: {
      forgotPassword: jest.fn(),
      view: jest.fn(),
      submit: jest.fn(),
      success: jest.fn(),
    },
  },
}));
jest.mock('../../lib/storage-utils', () => ({
  storeAccountData: jest.fn(),
}));

const mockLocation = () => {
  return {
    pathname: '/signin',
  };
};
const mockNavigate = jest.fn();
jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation(),
}));

// TODO: Once https://mozilla-hub.atlassian.net/browse/FXA-6461 is resolved, we can
// add the l10n tests back in. Right now, they can't handle embedded tags.

function submit() {
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
}
function enterPasswordAndSubmit() {
  fireEvent.input(screen.getByLabelText('Password'), {
    target: { value: MOCK_PASSWORD },
  });
  submit();
}
const render = (props: Partial<SigninProps> = {}) => {
  renderWithLocalizationProvider(<Subject {...props} />);
};

/* Element rendered or not rendered functions */
function signInHeaderRendered(service: MozServices = MozServices.Default) {
  screen.getByRole('heading', {
    name: 'Sign in',
  });
  screen.getByText(`Continue to ${service}`);
}
function privacyAndTermsRendered() {
  const terms = screen.getByRole('link', {
    name: /Terms of Service/,
  });
  const privacy = screen.getByRole('link', {
    name: /Privacy Notice/,
  });
  expect(terms).toHaveAttribute('href', '/legal/terms');
  expect(privacy).toHaveAttribute('href', '/legal/privacy');
}

function thirdPartyAuthRendered() {
  screen.getByRole('button', {
    name: /Continue with Google/,
  });
  screen.getByRole('button', {
    name: /Continue with Apple/,
  });
}
function signInButtonAndSeparatorRendered() {
  screen.getByRole('button', { name: 'Sign in' });
  screen.getByText('or');
}
function passwordInputRendered() {
  screen.getByLabelText('Password');
}
function passwordInputNotRendered() {
  expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();
}
function avatarAndEmailRendered() {
  screen.getByAltText('Your avatar');
  screen.getByText(MOCK_EMAIL);
}
function resetPasswordLinkRendered() {
  expect(
    screen.getByRole('link', { name: 'Forgot password?' })
  ).toHaveAttribute('href', '/reset_password');
}
function differentAccountLinkRendered() {
  screen.getByRole('link', { name: 'Use a different account' });
}

describe('Signin', () => {
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('without sessionToken', () => {
    describe('user has a password', () => {
      it('renders as expected', () => {
        render();

        expect(GleanMetrics.login.view).toHaveBeenCalledTimes(1);
        screen.getByRole('heading', {
          name: 'Enter your password for your Mozilla account',
        });
        avatarAndEmailRendered();
        passwordInputRendered();
        thirdPartyAuthRendered();
        signInButtonAndSeparatorRendered();
        privacyAndTermsRendered();
        resetPasswordLinkRendered();
        differentAccountLinkRendered();
      });

      it('emits an event on forgot password link click', async () => {
        render();
        fireEvent.click(screen.getByText('Forgot password?'));
        await waitFor(() => {
          expect(GleanMetrics.login.forgotPassword).toBeCalledTimes(1);
        });
      });

      describe('signInWithPassword', () => {
        it('renders tooltip on empty field submission, clears onchange', async () => {
          const beginSigninHandler = jest.fn();
          render({ beginSigninHandler });
          submit();
          await waitFor(() => {
            screen.getByText('Valid password required');
          });
          expect(GleanMetrics.login.submit).not.toHaveBeenCalled();
          expect(beginSigninHandler).not.toHaveBeenCalled();

          fireEvent.input(screen.getByLabelText(/Password/), {
            target: { value: MOCK_PASSWORD },
          });
          await waitFor(() => {
            expect(
              screen.queryByText('Valid password required')
            ).not.toBeInTheDocument();
          });
        });

        describe('successful submission', () => {
          it('submits and emits metrics', async () => {
            const beginSigninHandler = jest
              .fn()
              .mockReturnValueOnce(createBeginSigninResponse());
            render({ beginSigninHandler });
            enterPasswordAndSubmit();
            await waitFor(() => {
              expect(beginSigninHandler).toHaveBeenCalledWith(
                MOCK_EMAIL,
                MOCK_PASSWORD
              );
            });
            expect(GleanMetrics.login.submit).toHaveBeenCalledTimes(1);
            expect(GleanMetrics.login.success).toHaveBeenCalledTimes(1);
            expect(storeAccountData).toHaveBeenCalled();
          });

          it('navigates to /signin_totp_code when TOTP verification requested', async () => {
            const beginSigninHandler = jest.fn().mockReturnValueOnce(
              createBeginSigninResponse({
                verified: false,
                verificationMethod: VerificationMethods.TOTP_2FA,
              })
            );
            render({ beginSigninHandler });

            enterPasswordAndSubmit();
            await waitFor(() => {
              expect(mockNavigate).toHaveBeenCalledWith('/signin_totp_code', {
                state: {
                  email: MOCK_EMAIL,
                  uid: MOCK_UID,
                  sessionToken: MOCK_SESSION_TOKEN,
                  verified: false,
                  verificationMethod: VerificationMethods.TOTP_2FA,
                  verificationReason: VerificationReasons.SIGN_IN,
                },
              });
            });
          });

          it('navigates to /confirm_signup_code when account unverified', async () => {
            const beginSigninHandler = jest.fn().mockReturnValueOnce(
              createBeginSigninResponse({
                verified: false,
                verificationReason: VerificationReasons.SIGN_UP,
              })
            );
            render({ beginSigninHandler });

            enterPasswordAndSubmit();
            await waitFor(() => {
              expect(mockNavigate).toHaveBeenCalledWith(
                '/confirm_signup_code',
                {
                  state: {
                    email: MOCK_EMAIL,
                    uid: MOCK_UID,
                    sessionToken: MOCK_SESSION_TOKEN,
                    verified: false,
                    verificationReason: 'signup',
                    verificationMethod: 'email-otp',
                  },
                }
              );
            });
          });

          it('navigates to /signin_token_code when session unverified', async () => {
            const beginSigninHandler = jest.fn().mockReturnValueOnce(
              createBeginSigninResponse({
                verified: false,
              })
            );
            render({ beginSigninHandler });

            enterPasswordAndSubmit();
            await waitFor(() => {
              expect(mockNavigate).toHaveBeenCalledWith('/signin_token_code', {
                state: {
                  email: MOCK_EMAIL,
                  uid: MOCK_UID,
                  sessionToken: MOCK_SESSION_TOKEN,
                  verified: false,
                  verificationMethod: 'email-otp',
                  verificationReason: VerificationReasons.SIGN_IN,
                },
              });
            });
          });

          it('navigates to /settings', async () => {
            const beginSigninHandler = jest
              .fn()
              .mockReturnValueOnce(createBeginSigninResponse());
            render({ beginSigninHandler });

            enterPasswordAndSubmit();
            await waitFor(() => {
              expect(mockNavigate).toHaveBeenCalledWith('/settings');
            });
          });

          describe('OAuth integration', () => {
            describe('wants keys', () => {
              it('navigates to /confirm_signup_code with router state including keys', async () => {
                const beginSigninHandler = jest.fn().mockReturnValueOnce(
                  createBeginSigninResponse({
                    verified: false,
                    verificationReason: VerificationReasons.SIGN_UP,
                    keyFetchToken: MOCK_KEY_FETCH_TOKEN,
                    unwrapBKey: MOCK_UNWRAP_BKEY,
                  })
                );
                const finishOAuthFlowHandler = jest
                  .fn()
                  .mockReturnValueOnce(MOCK_OAUTH_FLOW_HANDLER_RESPONSE);
                const integration = createMockSigninOAuthIntegration();
                render({
                  beginSigninHandler,
                  integration,
                  finishOAuthFlowHandler,
                });

                enterPasswordAndSubmit();
                await waitFor(() => {
                  expect(mockNavigate).toHaveBeenCalledWith(
                    '/confirm_signup_code',
                    {
                      state: {
                        email: MOCK_EMAIL,
                        uid: MOCK_UID,
                        sessionToken: MOCK_SESSION_TOKEN,
                        verified: false,
                        verificationReason: 'signup',
                        verificationMethod: 'email-otp',
                        keyFetchToken: MOCK_KEY_FETCH_TOKEN,
                        unwrapBKey: MOCK_UNWRAP_BKEY,
                      },
                    }
                  );
                });
              });
            });

            describe('does not want keys', () => {
              it('navigates to /confirm_signup_code with router state and no keys', async () => {
                const beginSigninHandler = jest.fn().mockReturnValueOnce(
                  createBeginSigninResponse({
                    verified: false,
                    verificationReason: VerificationReasons.SIGN_UP,
                  })
                );
                const finishOAuthFlowHandler = jest
                  .fn()
                  .mockReturnValueOnce(MOCK_OAUTH_FLOW_HANDLER_RESPONSE);
                const integration = createMockSigninOAuthIntegration();
                render({
                  beginSigninHandler,
                  integration,
                  finishOAuthFlowHandler,
                });

                enterPasswordAndSubmit();
                await waitFor(() => {
                  expect(mockNavigate).toHaveBeenCalledWith(
                    '/confirm_signup_code',
                    {
                      state: {
                        email: MOCK_EMAIL,
                        uid: MOCK_UID,
                        sessionToken: MOCK_SESSION_TOKEN,
                        verified: false,
                        verificationReason: 'signup',
                        verificationMethod: 'email-otp',
                      },
                    }
                  );
                });
              });
            });
          });
        });
      });

      describe('errored submission', () => {
        it('shows error due to incorrect password', async () => {
          const response = createBeginSigninResponseError();
          const beginSigninHandler = jest.fn().mockReturnValueOnce(response);
          render({ beginSigninHandler });

          enterPasswordAndSubmit();
          await waitFor(() => {
            screen.getByText('Incorrect password');
          });
          expect(GleanMetrics.login.submit).toHaveBeenCalledTimes(1);
          expect(GleanMetrics.login.error).toHaveBeenCalledWith({
            reason: response.error.message,
          });
          expect(GleanMetrics.login.error).toHaveBeenCalledTimes(1);
        });
      });

      it('handles error due to throttled or blocked request', async () => {
        const beginSigninHandler = jest.fn().mockReturnValueOnce(
          createBeginSigninResponseError({
            errno: AuthUiErrors.THROTTLED.errno,
          })
        );
        const sendUnblockEmailHandler = jest.fn().mockReturnValueOnce({});
        render({ beginSigninHandler, sendUnblockEmailHandler });

        enterPasswordAndSubmit();
        await waitFor(() => {
          expect(sendUnblockEmailHandler).toHaveBeenCalled();
          expect(mockNavigate).toHaveBeenCalledWith('/signin_unblock', {
            state: {
              email: MOCK_EMAIL,
              hasLinkedAccount: false,
              hasPassword: true,
              password: MOCK_PASSWORD,
            },
          });
        });
      });

      it('handles error on request to send unblock email', async () => {
        const beginSigninHandler = jest.fn().mockReturnValueOnce(
          createBeginSigninResponseError({
            errno: AuthUiErrors.THROTTLED.errno,
          })
        );
        const sendUnblockEmailHandler = jest
          .fn()
          .mockReturnValueOnce({ localizedErrorMessage: 'Some error' });
        render({ beginSigninHandler, sendUnblockEmailHandler });

        enterPasswordAndSubmit();
        await waitFor(() => {
          expect(sendUnblockEmailHandler).toHaveBeenCalled();
          expect(mockNavigate).not.toHaveBeenCalled();
          expect(screen.getByText('Some error')).toBeInTheDocument();
        });
      });

      it('handles error due to hard bounce or email complaint', async () => {
        const beginSigninHandler = jest.fn().mockReturnValueOnce(
          createBeginSigninResponseError({
            errno: AuthUiErrors.EMAIL_HARD_BOUNCE.errno,
          })
        );
        render({ beginSigninHandler });

        enterPasswordAndSubmit();
        await waitFor(() => {
          expect(mockNavigate).toHaveBeenCalledWith('/signin_bounced');
        });
        expect(GleanMetrics.login.submit).toHaveBeenCalledTimes(1);
        expect(GleanMetrics.login.error).toHaveBeenCalledWith({
          reason: AuthUiErrors.EMAIL_HARD_BOUNCE.message,
        });
        expect(GleanMetrics.login.error).toHaveBeenCalledTimes(1);
      });

      it('handles error due to TOTP required or insufficent ARC value', async () => {
        const beginSigninHandler = jest.fn().mockReturnValueOnce(
          createBeginSigninResponseError({
            errno: AuthUiErrors.TOTP_REQUIRED.errno,
          })
        );
        render({ beginSigninHandler });

        enterPasswordAndSubmit();
        await waitFor(() => {
          expect(mockNavigate).toHaveBeenCalledWith('/inline_totp_setup');
        });
        expect(GleanMetrics.login.submit).toHaveBeenCalledTimes(1);
        expect(GleanMetrics.login.error).toHaveBeenCalledWith({
          reason: AuthUiErrors.TOTP_REQUIRED.message,
        });
        expect(GleanMetrics.login.error).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('user does not have a password', () => {
    it('renders as expected without linked account', () => {
      render({ hasPassword: false });

      signInHeaderRendered();
      avatarAndEmailRendered();
      signInButtonAndSeparatorRendered();
      thirdPartyAuthRendered();
      privacyAndTermsRendered();
      differentAccountLinkRendered();
      resetPasswordLinkRendered();

      passwordInputNotRendered();
    });

    it('renders as expected with linked account', () => {
      render({ hasPassword: false, hasLinkedAccount: true });
      signInHeaderRendered();
      avatarAndEmailRendered();
      thirdPartyAuthRendered();
      privacyAndTermsRendered();

      passwordInputNotRendered();
      expect(
        screen.queryByRole('link', { name: 'Forgot password?' })
      ).not.toBeInTheDocument();
      expect(screen.queryByText('Or')).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Sign in' })
      ).not.toBeInTheDocument();
    });
  });
});

describe('with sessionToken', () => {
  it('renders as expected', () => {
    renderWithLocalizationProvider(
      <Subject sessionToken={MOCK_SESSION_TOKEN} />
    );

    expect(GleanMetrics.cachedLogin.view).toHaveBeenCalledTimes(1);
    signInHeaderRendered();
    avatarAndEmailRendered();
    thirdPartyAuthRendered();
    signInButtonAndSeparatorRendered();
    privacyAndTermsRendered();
    resetPasswordLinkRendered();
    differentAccountLinkRendered();

    passwordInputNotRendered();
  });

  it('emits an event on forgot password link click', async () => {
    renderWithLocalizationProvider(
      <Subject sessionToken={MOCK_SESSION_TOKEN} />
    );

    fireEvent.click(screen.getByText('Forgot password?'));
    await waitFor(() => {
      expect(GleanMetrics.cachedLogin.forgotPassword).toBeCalledTimes(1);
    });
  });

  describe('successful submission', () => {
    it('submits and emits metrics', async () => {
      const cachedSigninHandler = jest
        .fn()
        .mockReturnValueOnce(CACHED_SIGNIN_HANDLER_RESPONSE);
      renderWithLocalizationProvider(
        <Subject
          sessionToken={MOCK_SESSION_TOKEN}
          {...{ cachedSigninHandler }}
        />
      );

      submit();
      await waitFor(() => {
        expect(cachedSigninHandler).toHaveBeenCalledWith(MOCK_SESSION_TOKEN);
      });
      expect(GleanMetrics.cachedLogin.submit).toHaveBeenCalledTimes(1);
      expect(GleanMetrics.cachedLogin.success).toHaveBeenCalledTimes(1);
    });

    describe('OAuth integration', () => {
      let hardNavigateSpy: jest.SpyInstance;
      beforeEach(() => {
        hardNavigateSpy = jest
          .spyOn(utils, 'hardNavigate')
          .mockImplementation(() => {});
      });

      afterEach(() => {
        hardNavigateSpy.mockRestore();
      });

      it('navigates to OAuth redirect', async () => {
        const cachedSigninHandler = jest
          .fn()
          .mockReturnValueOnce(CACHED_SIGNIN_HANDLER_RESPONSE);
        const finishOAuthFlowHandler = jest
          .fn()
          .mockReturnValueOnce(MOCK_OAUTH_FLOW_HANDLER_RESPONSE);
        const integration = createMockSigninOAuthIntegration();
        render({
          cachedSigninHandler,
          integration,
          finishOAuthFlowHandler,
          sessionToken: MOCK_SESSION_TOKEN,
        });

        enterPasswordAndSubmit();
        await waitFor(() => {
          expect(hardNavigateSpy).toHaveBeenCalledWith('someUri');
        });
      });
    });
  });

  describe('errored submission', () => {
    it('requires password if cached credentials have expired', async () => {
      const cachedSigninHandler = jest
        .fn()
        .mockReturnValueOnce(createCachedSigninResponseError());
      renderWithLocalizationProvider(
        <Subject
          sessionToken={MOCK_SESSION_TOKEN}
          {...{ cachedSigninHandler }}
        />
      );

      submit();
      await waitFor(() => {
        expect(cachedSigninHandler).toHaveBeenCalledWith(MOCK_SESSION_TOKEN);
        screen.getByText('Session expired. Sign in to continue.');
        passwordInputRendered();
      });
    });

    it('displays other errors', async () => {
      const unexpectedError = AuthUiErrors.UNEXPECTED_ERROR;
      const cachedSigninHandler = jest.fn().mockReturnValueOnce(
        createCachedSigninResponseError({
          errno: unexpectedError.errno,
        })
      );
      renderWithLocalizationProvider(
        <Subject
          sessionToken={MOCK_SESSION_TOKEN}
          {...{ cachedSigninHandler }}
        />
      );

      submit();
      await waitFor(() => {
        screen.getByText(unexpectedError.message);
        passwordInputNotRendered();
      });
    });
  });

  describe('hardNavigateToContentServer', () => {
    let hardNavigateToContentServerSpy: jest.SpyInstance;

    beforeEach(() => {
      hardNavigateToContentServerSpy = jest
        .spyOn(utils, 'hardNavigateToContentServer')
        .mockImplementation(() => {});
    });
    afterEach(() => {
      hardNavigateToContentServerSpy.mockRestore();
    });

    it('allows users to use a different account', async () => {
      render();

      await waitFor(() => {
        fireEvent.click(
          screen.getByRole('link', {
            name: 'Use a different account',
          })
        );
      });
      expect(hardNavigateToContentServerSpy).toHaveBeenCalledWith(
        `/?prefillEmail=${encodeURIComponent(MOCK_EMAIL)}`
      );
    });
  });

  describe('when client is Pocket', () => {
    it('shows Pocket in header', () => {
      renderWithLocalizationProvider(
        <Subject
          sessionToken={MOCK_SESSION_TOKEN}
          serviceName={MozServices.Pocket}
          integration={createMockSigninOAuthIntegration(
            POCKET_CLIENTIDS[0],
            false
          )}
        />
      );

      const pocketLogo = screen.getByLabelText('Pocket');
      expect(pocketLogo).toBeInTheDocument();
    });

    it('shows Pocket-specific TOS', () => {
      renderWithLocalizationProvider(
        <Subject
          integration={createMockSigninOAuthIntegration(POCKET_CLIENTIDS[0])}
        />
      );

      // Pocket links should always open in a new window (announced by screen readers)
      const pocketTermsLink = screen.getByRole('link', {
        name: 'Terms of Service Opens in new window',
      });
      const pocketPrivacyLink = screen.getByRole('link', {
        name: 'Privacy Notice Opens in new window',
      });

      expect(pocketTermsLink).toHaveAttribute(
        'href',
        'https://getpocket.com/tos/'
      );
      expect(pocketPrivacyLink).toHaveAttribute(
        'href',
        'https://getpocket.com/privacy/'
      );
    });
  });

  describe('when client is Monitor', () => {
    it('shows Monitor-specific TOS', async () => {
      renderWithLocalizationProvider(
        <Subject
          integration={createMockSigninOAuthIntegration(MONITOR_CLIENTIDS[0])}
        />
      );

      // Monitor links should always open in a new window (announced by screen readers)
      const monitorTermsLink = screen.getByRole('link', {
        name: 'Terms of Service Opens in new window',
      });
      const monitorPrivacyLink = screen.getByRole('link', {
        name: 'Privacy Notice Opens in new window',
      });

      expect(monitorTermsLink).toHaveAttribute(
        'href',
        'https://www.mozilla.org/about/legal/terms/subscription-services/'
      );
      expect(monitorPrivacyLink).toHaveAttribute(
        'href',
        'https://www.mozilla.org/privacy/subscription-services/'
      );
    });
  });
});

// TODO in FXA-9059: make sure third party auth is not rendered for sync if account has a password
