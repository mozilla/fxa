/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import {
  fireEvent,
  screen,
  waitFor,
  act,
  within,
} from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';

import GleanMetrics from '../../lib/glean';
import {
  CACHED_SIGNIN_HANDLER_RESPONSE,
  createBeginSigninResponse,
  createBeginSigninResponseError,
  createCachedSigninResponseError,
  createMockSigninWebIntegration,
  createMockSigninOAuthIntegration,
  createMockSigninOAuthNativeIntegration,
  createMockSigninOAuthNativeSyncIntegration,
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
import firefox from '../../lib/channels/firefox';
import { navigate } from '@reach/router';
import { IntegrationType } from '../../models';
import { SensitiveData } from '../../lib/sensitive-data-client';
import userEvent, { UserEvent } from '@testing-library/user-event';
import * as SigninUtils from './utils';
import { mockWindowLocation } from 'fxa-react/lib/test-utils/mockWindowLocation';

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
    isDone: jest.fn(),
    login: {
      forgotPassword: jest.fn(),
      view: jest.fn(),
      submit: jest.fn(),
      success: jest.fn(),
      error: jest.fn(),
      diffAccountLinkClick: jest.fn(),
      engage: jest.fn(),
      lockedAccountBannerView: jest.fn(),
    },
    cachedLogin: {
      forgotPassword: jest.fn(),
      view: jest.fn(),
      submit: jest.fn(),
      success: jest.fn(),
    },
    thirdPartyAuth: {
      loginNoPwView: jest.fn(),
      startGoogleAuthFromLogin: jest.fn(),
      startAppleAuthFromLogin: jest.fn(),
      appleDeeplink: jest.fn(),
      googleDeeplink: jest.fn(),
    },
  },
}));
jest.mock('../../lib/storage-utils', () => ({
  storeAccountData: jest.fn(),
}));

const mockSetData = jest.fn();
jest.mock('../../models', () => {
  return {
    ...jest.requireActual('../../models'),
    useSensitiveDataClient: () => {
      return {
        setDataType: mockSetData,
      };
    },
  };
});

const mockNavigate = jest.fn();

jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  navigate: jest.fn(),
  useNavigate: () => mockNavigate,
}));

const serviceRelayText =
  'Firefox will try sending you back to use an email mask after you sign in.';

// TODO: Once https://mozilla-hub.atlassian.net/browse/FXA-6461 is resolved, we can
// add the l10n tests back in. Right now, they can't handle embedded tags.

/**
 * Uses `userEvent.click` to simulate a user clicking the `Sign In` button.
 */
async function submit() {
  await user.click(screen.getByRole('button', { name: 'Sign in' }));
}
/**
 * Uses `userEvent.type` to simulate a user typing the password and then clicking the `Sign In` button.
 */
async function enterPasswordAndSubmit() {
  await user.type(screen.getByLabelText('Password'), MOCK_PASSWORD);
  await submit();
}
const render = (props: Partial<SigninProps> = {}) =>
  renderWithLocalizationProvider(<Subject {...props} />);

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
function defaultAvatarAndEmailRendered() {
  screen.getByAltText('Default avatar');
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

let user: UserEvent;
describe('Signin component', () => {
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });

  beforeEach(() => {
    user = userEvent.setup();

    // because there is a navigation that happens in one test during the forgot password flow,
    // we need to mock location so that it can be reset fully between each test, otherwise
    // the reach router holds onto the last location and then renders the forgot password page anchor
    // with an `aria-current="page"` attribute since it thinks we're on that page when we're not.
    mockWindowLocation({ pathname: '/signin' });
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  describe('without sessionToken', () => {
    describe('user has a password', () => {
      it('renders as expected', () => {
        render();

        expect(GleanMetrics.login.view).toHaveBeenCalledTimes(1);
        expect(GleanMetrics.login.view).toHaveBeenCalledWith({
          event: { thirdPartyLinks: true },
        });
        screen.getByRole('heading', {
          name: 'Enter your password for your Mozilla account',
        });
        defaultAvatarAndEmailRendered();
        passwordInputRendered();
        thirdPartyAuthRendered();
        signInButtonAndSeparatorRendered();
        privacyAndTermsRendered();
        resetPasswordLinkRendered();
        differentAccountLinkRendered();
        expect(screen.queryByText(serviceRelayText)).not.toBeInTheDocument();
      });

      it('does not render third party auth for sync, emits expected Glean event', async () => {
        const hardNavigateSpy = jest
          .spyOn(utils, 'hardNavigate')
          .mockImplementation(() => {});

        const integration = createMockSigninOAuthNativeSyncIntegration();
        render({ integration });
        await enterPasswordAndSubmit();

        // There is a hardNavigate that happens in this flow, if we don't
        // mock/spy on it then it logs an error the next time a test tries
        // to `enterPasswordAndSubmit()` because it's wrapped in a `setTimeout`
        expect(hardNavigateSpy).toHaveBeenCalled();

        expect(
          screen.queryByRole('button', { name: /Continue with Google/ })
        ).not.toBeInTheDocument();
        expect(
          screen.queryByRole('button', { name: /Continue with Apple/ })
        ).not.toBeInTheDocument();
        expect(GleanMetrics.login.view).toHaveBeenCalledWith({
          event: { thirdPartyLinks: false },
        });
      });

      it('emits an event on forgot password link click', async () => {
        render();
        fireEvent.click(screen.getByText('Forgot password?'));
        await waitFor(() => {
          expect(GleanMetrics.login.forgotPassword).toHaveBeenCalledTimes(1);
        });
      });

      it('emits an event when password field is focused', async () => {
        render();
        expect(
          fireEvent.input(screen.getByLabelText(/Password/), {
            target: {
              value: MOCK_PASSWORD.substring(0, MOCK_PASSWORD.length - 2),
            },
          })
        ).toBeTruthy();
        expect(
          fireEvent.input(screen.getByLabelText(/Password/), {
            target: { value: MOCK_PASSWORD },
          })
        ).toBeTruthy();

        await waitFor(() => {
          // Make sure event didn't double fire.
          expect(GleanMetrics.login.engage).toHaveBeenCalledTimes(1);
        });
      });

      describe('signInWithPassword', () => {
        it('renders tooltip on empty field submission, clears onchange', async () => {
          const beginSigninHandler = jest.fn();
          render({ beginSigninHandler });
          await submit();
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

        describe('account locked', () => {
          it('shows the error banner', async () => {
            const beginSigninHandler = jest.fn().mockReturnValueOnce(
              createBeginSigninResponseError({
                errno: AuthUiErrors.ACCOUNT_RESET.errno,
              })
            );
            render({ beginSigninHandler });

            await enterPasswordAndSubmit();

            expect(
              await screen.findByText('Reset your password')
            ).toBeVisible();
            expect(
              await screen.findByText(
                'We locked your account to keep it safe from suspicious activity.'
              )
            ).toBeVisible();
            const resetPasswordLink = await screen.findByRole('link', {
              name: 'Reset your password to sign in',
            });
            expect(resetPasswordLink).toHaveAttribute(
              'href',
              `/reset_password?email=${MOCK_EMAIL}&email_to_hash_with=`
            );
            expect(resetPasswordLink).toHaveAttribute(
              'data-glean-id',
              'login_locked_account_banner_link'
            );
            expect(GleanMetrics.login.error).toHaveBeenCalledWith({
              event: { reason: AuthUiErrors.ACCOUNT_RESET.message },
            });
            expect(
              GleanMetrics.login.lockedAccountBannerView
            ).toHaveBeenCalledTimes(1);
          });
        });

        describe('successful submission', () => {
          it('submits and emits metrics', async () => {
            const beginSigninHandler = jest
              .fn()
              .mockReturnValueOnce(createBeginSigninResponse());
            render({ beginSigninHandler });
            await enterPasswordAndSubmit();

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

            await enterPasswordAndSubmit();
            await waitFor(() => {
              expect(navigate).toHaveBeenCalledWith('/signin_totp_code', {
                replace: false,
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

            await enterPasswordAndSubmit();
            await waitFor(() => {
              expect(navigate).toHaveBeenCalledWith('/confirm_signup_code', {
                replace: false,
                state: {
                  email: MOCK_EMAIL,
                  uid: MOCK_UID,
                  sessionToken: MOCK_SESSION_TOKEN,
                  verified: false,
                  verificationReason: 'signup',
                  verificationMethod: 'email-otp',
                },
              });
            });
          });

          it('navigates to /signin_token_code when session unverified', async () => {
            const beginSigninHandler = jest.fn().mockReturnValueOnce(
              createBeginSigninResponse({
                verified: false,
              })
            );
            render({ beginSigninHandler });

            await enterPasswordAndSubmit();
            await waitFor(() => {
              expect(navigate).toHaveBeenCalledWith('/signin_token_code', {
                replace: false,
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

          it('OAuth forced 2FA without TOTP navigates to /signin_token_code (email OTP first)', async () => {
            const beginSigninHandler = jest.fn().mockReturnValueOnce(
              createBeginSigninResponse({
                verified: false,
                verificationMethod: VerificationMethods.EMAIL_OTP,
              })
            );
            const integration = createMockSigninOAuthIntegration();
            // Force RP to require two-step authentication
            (integration.wantsTwoStepAuthentication as unknown as
              | jest.Mock
              | undefined) = undefined;
            integration.wantsTwoStepAuthentication = () => true;

            render({ beginSigninHandler, integration });

            await enterPasswordAndSubmit();

            await waitFor(() => {
              expect(navigate).toHaveBeenCalledWith('/signin_token_code', {
                replace: false,
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

          it('navigates to /inline_recovery_key_setup when showInlineRecoveryKeySetup is true', async () => {
            const integration = createMockSigninOAuthNativeSyncIntegration();
            const beginSigninHandler = jest.fn().mockReturnValueOnce(
              createBeginSigninResponse({
                showInlineRecoveryKeySetup: true,
                keyFetchToken: MOCK_KEY_FETCH_TOKEN,
                unwrapBKey: MOCK_UNWRAP_BKEY,
              })
            );
            render({ beginSigninHandler, integration });

            await enterPasswordAndSubmit();
            await waitFor(() => {
              expect(navigate).toHaveBeenCalledWith(
                '/inline_recovery_key_setup?',
                {
                  replace: true,
                  state: {
                    email: MOCK_EMAIL,
                    uid: MOCK_UID,
                    sessionToken: MOCK_SESSION_TOKEN,
                    verified: true,
                    showInlineRecoveryKeySetup: true,
                    verificationMethod: 'email-otp',
                    verificationReason: VerificationReasons.SIGN_IN,
                  },
                }
              );
            });
          });

          it('navigates to /settings', async () => {
            const beginSigninHandler = jest
              .fn()
              .mockReturnValueOnce(createBeginSigninResponse());
            render({ beginSigninHandler });

            await enterPasswordAndSubmit();
            await waitFor(() => {
              expect(navigate).toHaveBeenCalledWith('/settings', {
                replace: false,
              });
            });
          });

          // When CAD is converted to React, just test navigation since CAD will handle fxaLogin
          describe('fxaLogin webchannel message', () => {
            let fxaLoginSpy: jest.SpyInstance;
            let hardNavigateSpy: jest.SpyInstance;
            beforeEach(() => {
              fxaLoginSpy = jest.spyOn(firefox, 'fxaLogin');
              hardNavigateSpy = jest
                .spyOn(utils, 'hardNavigate')
                .mockImplementation(() => {});
            });
            it('is sent if Sync integration and navigates to CAD', async () => {
              const beginSigninHandler = jest.fn().mockReturnValueOnce(
                createBeginSigninResponse({
                  keyFetchToken: MOCK_KEY_FETCH_TOKEN,
                  unwrapBKey: MOCK_UNWRAP_BKEY,
                })
              );
              const integration = createMockSigninOAuthNativeSyncIntegration({
                type: IntegrationType.SyncDesktopV3,
              });
              render({ beginSigninHandler, integration });
              await enterPasswordAndSubmit();
              await waitFor(() => {
                // Since it's not OAuth, this should be called with keyFetchToken and unwrapBKey
                expect(fxaLoginSpy).toHaveBeenCalledWith({
                  email: MOCK_EMAIL,
                  sessionToken: MOCK_SESSION_TOKEN,
                  uid: MOCK_UID,
                  verified: true,
                  services: { sync: {} },
                  keyFetchToken: MOCK_KEY_FETCH_TOKEN,
                  unwrapBKey: MOCK_UNWRAP_BKEY,
                });
              });
              expect(hardNavigateSpy).toHaveBeenCalledWith(
                '/pair?showSuccessMessage=true',
                undefined,
                undefined,
                false
              );
            });
            it('is not sent if user has 2FA enabled', async () => {
              const beginSigninHandler = jest.fn().mockReturnValueOnce(
                createBeginSigninResponse({
                  verified: false,
                  verificationMethod: VerificationMethods.TOTP_2FA,
                })
              );
              const integration = createMockSigninOAuthNativeSyncIntegration();
              await act(() => {
                render({ beginSigninHandler, integration });
              });
              await await enterPasswordAndSubmit();
              expect(fxaLoginSpy).not.toHaveBeenCalled();
            });
            it('is not sent otherwise', async () => {
              render();
              await enterPasswordAndSubmit();
              expect(fxaLoginSpy).not.toHaveBeenCalled();
              expect(hardNavigateSpy).not.toHaveBeenCalled();
            });
          });

          describe('OAuth integration', () => {
            let fxaOAuthLoginSpy: jest.SpyInstance;
            let fxaLoginSpy: jest.SpyInstance;
            let hardNavigateSpy: jest.SpyInstance;
            let finishOAuthFlowHandler: jest.Mock;
            beforeEach(() => {
              fxaOAuthLoginSpy = jest.spyOn(firefox, 'fxaOAuthLogin');
              fxaLoginSpy = jest.spyOn(firefox, 'fxaLogin');
              hardNavigateSpy = jest
                .spyOn(utils, 'hardNavigate')
                .mockImplementation(() => {});
              finishOAuthFlowHandler = jest
                .fn()
                .mockReturnValueOnce(MOCK_OAUTH_FLOW_HANDLER_RESPONSE);
            });
            it('unverified, wantsKeys, navigates to /confirm_signup_code with keys', async () => {
              const beginSigninHandler = jest.fn().mockReturnValueOnce(
                createBeginSigninResponse({
                  verified: false,
                  verificationReason: VerificationReasons.SIGN_UP,
                  keyFetchToken: MOCK_KEY_FETCH_TOKEN,
                  unwrapBKey: MOCK_UNWRAP_BKEY,
                })
              );
              const integration = createMockSigninOAuthIntegration();
              render({
                beginSigninHandler,
                integration,
                finishOAuthFlowHandler,
              });

              await enterPasswordAndSubmit();
              await waitFor(() => {
                expect(navigate).toHaveBeenCalledWith('/confirm_signup_code', {
                  replace: false,
                  state: {
                    email: MOCK_EMAIL,
                    uid: MOCK_UID,
                    sessionToken: MOCK_SESSION_TOKEN,
                    verified: false,
                    verificationReason: 'signup',
                    verificationMethod: 'email-otp',
                  },
                });
              });
            });
            it('unverified, does not want keys, navigates to /confirm_signup_code without keys', async () => {
              const beginSigninHandler = jest.fn().mockReturnValueOnce(
                createBeginSigninResponse({
                  verified: false,
                  verificationReason: VerificationReasons.SIGN_UP,
                })
              );
              const integration = createMockSigninOAuthIntegration();
              render({
                beginSigninHandler,
                integration,
                finishOAuthFlowHandler,
              });

              await enterPasswordAndSubmit();
              await waitFor(() => {
                expect(navigate).toHaveBeenCalledWith('/confirm_signup_code', {
                  replace: false,
                  state: {
                    email: MOCK_EMAIL,
                    uid: MOCK_UID,
                    sessionToken: MOCK_SESSION_TOKEN,
                    verified: false,
                    verificationReason: 'signup',
                    verificationMethod: 'email-otp',
                  },
                });
              });
            });
            it('verified, not sync, navigates to RP redirect', async () => {
              const beginSigninHandler = jest.fn().mockReturnValueOnce(
                createBeginSigninResponse({
                  keyFetchToken: MOCK_KEY_FETCH_TOKEN,
                  unwrapBKey: MOCK_UNWRAP_BKEY,
                })
              );
              const integration = createMockSigninOAuthIntegration();
              render({
                beginSigninHandler,
                integration,
                finishOAuthFlowHandler,
              });
              await enterPasswordAndSubmit();
              await waitFor(() => {
                expect(fxaOAuthLoginSpy).not.toHaveBeenCalled();
                expect(hardNavigateSpy).toHaveBeenCalledWith(
                  MOCK_OAUTH_FLOW_HANDLER_RESPONSE.redirect,
                  undefined,
                  undefined,
                  true
                );
              });
            });
            it('verified, service=sync, navigates to pair and sends fxaOAuthLogin', async () => {
              const beginSigninHandler = jest.fn().mockReturnValueOnce(
                createBeginSigninResponse({
                  keyFetchToken: MOCK_KEY_FETCH_TOKEN,
                  unwrapBKey: MOCK_UNWRAP_BKEY,
                })
              );
              const integration = createMockSigninOAuthNativeIntegration();
              render({
                beginSigninHandler,
                integration,
                finishOAuthFlowHandler,
              });
              await enterPasswordAndSubmit();
              await waitFor(() => {
                // Ensure it's not called with keyFetchToken, unwrapBKey, or { relay: {} }
                expect(fxaLoginSpy).toHaveBeenCalledWith({
                  email: MOCK_EMAIL,
                  sessionToken: MOCK_SESSION_TOKEN,
                  uid: MOCK_UID,
                  verified: true,
                  services: { sync: {} },
                });
                expect(fxaOAuthLoginSpy).toHaveBeenCalledWith({
                  action: 'signin',
                  ...MOCK_OAUTH_FLOW_HANDLER_RESPONSE,
                });

                const fxaLoginCallOrder =
                  fxaLoginSpy.mock.invocationCallOrder[0];
                const fxaOAuthLoginCallOrder =
                  fxaOAuthLoginSpy.mock.invocationCallOrder[0];
                // Ensure fxaLogin is called first
                expect(fxaLoginCallOrder).toBeLessThan(fxaOAuthLoginCallOrder);

                expect(hardNavigateSpy).toHaveBeenCalledWith(
                  '/pair?showSuccessMessage=true',
                  undefined,
                  undefined,
                  true
                );
              });
            });

            it('verified, OAuthNative service=relay, navigates to settings and sends fxaOAuthLogin', async () => {
              const beginSigninHandler = jest.fn().mockReturnValueOnce(
                createBeginSigninResponse({
                  keyFetchToken: MOCK_KEY_FETCH_TOKEN,
                  unwrapBKey: MOCK_UNWRAP_BKEY,
                })
              );
              const integration = createMockSigninOAuthNativeIntegration({
                isSync: false,
              });
              render({
                beginSigninHandler,
                integration,
                finishOAuthFlowHandler,
              });
              screen.getByText(serviceRelayText);
              await enterPasswordAndSubmit();
              await waitFor(() => {
                // Ensure it's not called with keyFetchToken or unwrapBKey, or services: { sync: {} }
                expect(fxaLoginSpy).toHaveBeenCalledWith({
                  email: MOCK_EMAIL,
                  sessionToken: MOCK_SESSION_TOKEN,
                  uid: MOCK_UID,
                  verified: true,
                  services: { relay: {} },
                });
                expect(fxaOAuthLoginSpy).toHaveBeenCalledWith({
                  action: 'signin',
                  ...MOCK_OAUTH_FLOW_HANDLER_RESPONSE,
                });

                const fxaLoginCallOrder =
                  fxaLoginSpy.mock.invocationCallOrder[0];
                const fxaOAuthLoginCallOrder =
                  fxaOAuthLoginSpy.mock.invocationCallOrder[0];
                // Ensure fxaLogin is called first
                expect(fxaLoginCallOrder).toBeLessThan(fxaOAuthLoginCallOrder);

                expect(navigate).toHaveBeenCalledWith('/settings', {
                  replace: true,
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

          await enterPasswordAndSubmit();
          await waitFor(() => {
            screen.getByText('Incorrect password');
          });
          expect(GleanMetrics.login.submit).toHaveBeenCalledTimes(1);
          expect(GleanMetrics.login.error).toHaveBeenCalledWith({
            event: { reason: response.error.message },
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

        await enterPasswordAndSubmit();
        await waitFor(() => {
          expect(sendUnblockEmailHandler).toHaveBeenCalled();
          expect(mockSetData).toHaveBeenCalledWith(SensitiveData.Key.Password, {
            plainTextPassword: MOCK_PASSWORD,
          });
          expect(mockNavigate).toHaveBeenCalledWith('/signin_unblock', {
            state: {
              email: MOCK_EMAIL,
              hasLinkedAccount: false,
              hasPassword: true,
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

        await enterPasswordAndSubmit();
        await waitFor(() => {
          expect(sendUnblockEmailHandler).toHaveBeenCalled();
          expect(mockNavigate).not.toHaveBeenCalled();
          expect(navigate).not.toHaveBeenCalled();
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

        await enterPasswordAndSubmit();
        await waitFor(() => {
          expect(mockNavigate).toHaveBeenCalledWith('/signin_bounced');
        });
        expect(GleanMetrics.login.submit).toHaveBeenCalledTimes(1);
        expect(GleanMetrics.login.error).toHaveBeenCalledWith({
          event: { reason: AuthUiErrors.EMAIL_HARD_BOUNCE.message },
        });
        expect(GleanMetrics.login.error).toHaveBeenCalledTimes(1);
      });
    });

    describe('user does not have a password', () => {
      it('renders as expected without linked account', () => {
        render({ hasPassword: false });

        signInHeaderRendered();
        defaultAvatarAndEmailRendered();
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
        defaultAvatarAndEmailRendered();
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

      it('renders third party auth options for sync with linked account', () => {
        const integration = createMockSigninOAuthNativeSyncIntegration();
        render({ integration, hasPassword: false, hasLinkedAccount: true });

        signInHeaderRendered();
        expect(
          screen.queryByRole('button', { name: /Continue with Google/ })
        ).toBeInTheDocument();
        expect(
          screen.queryByRole('button', { name: /Continue with Apple/ })
        ).toBeInTheDocument();
      });
    });
  });

  describe('with sessionToken', () => {
    it('renders as expected', () => {
      renderWithLocalizationProvider(
        <Subject sessionToken={MOCK_SESSION_TOKEN} />
      );

      expect(GleanMetrics.cachedLogin.view).toHaveBeenCalledTimes(1);
      expect(GleanMetrics.cachedLogin.view).toHaveBeenCalledWith({
        event: { thirdPartyLinks: true },
      });
      signInHeaderRendered();
      avatarAndEmailRendered();
      thirdPartyAuthRendered();
      signInButtonAndSeparatorRendered();
      privacyAndTermsRendered();
      resetPasswordLinkRendered();
      differentAccountLinkRendered();

      passwordInputNotRendered();
    });

    // This is wrapped so that the HTMLFormElement.submit can be mocked
    // without affecting other tests.
    describe('deeplinking', () => {
      beforeEach(() => {
        HTMLFormElement.prototype.submit = jest.fn();
      });
      afterEach(() => {
        jest.resetAllMocks();
      });
      it('does not render when deeplinking third party auth', () => {
        renderWithLocalizationProvider(
          <Subject sessionToken={MOCK_SESSION_TOKEN} deeplink="appleLogin" />
        );

        expect(
          screen.queryByRole('button', { name: /Continue with Google/ })
        ).not.toBeInTheDocument();
        expect(
          screen.queryByRole('button', { name: /Continue with Apple/ })
        ).not.toBeInTheDocument();
      });
    });

    it('emits an event on forgot password link click', async () => {
      renderWithLocalizationProvider(
        <Subject sessionToken={MOCK_SESSION_TOKEN} />
      );

      fireEvent.click(screen.getByText('Forgot password?'));
      await waitFor(() => {
        expect(GleanMetrics.cachedLogin.forgotPassword).toHaveBeenCalledTimes(
          1
        );
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

        await submit();
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

        it('always renders password input when integration wants keys', () => {
          const integration = createMockSigninOAuthIntegration({
            wantsKeys: true,
          });
          render({ integration });
          passwordInputRendered();
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

          await enterPasswordAndSubmit();
          await waitFor(() => {
            expect(hardNavigateSpy).toHaveBeenCalledWith(
              'someUri',
              undefined,
              undefined,
              true
            );
          });
        });

        it('does not navigate when integration isFirefoxMobileClient and the sign-in is verified', async () => {
          const handleNavigationSpy = jest.spyOn(
            SigninUtils,
            'handleNavigation'
          );
          const finishOAuthFlowHandler = jest
            .fn()
            .mockReturnValueOnce(MOCK_OAUTH_FLOW_HANDLER_RESPONSE);
          const integration = createMockSigninOAuthNativeIntegration({
            isMobile: true,
          });
          render({
            beginSigninHandler: jest.fn().mockReturnValue(
              createBeginSigninResponse({
                verified: true,
              })
            ),
            integration,
            finishOAuthFlowHandler,
            sessionToken: MOCK_SESSION_TOKEN,
          });

          enterPasswordAndSubmit();
          await waitFor(() => {
            expect(handleNavigationSpy).toHaveBeenCalledWith(
              expect.objectContaining({
                performNavigation: false,
              })
            );
          });
          handleNavigationSpy.mockRestore();
        });

        it('still navigates if integration isFirefoxMobileClient and the sign-in is not verified', async () => {
          const handleNavigationSpy = jest.spyOn(
            SigninUtils,
            'handleNavigation'
          );
          const finishOAuthFlowHandler = jest
            .fn()
            .mockReturnValueOnce(MOCK_OAUTH_FLOW_HANDLER_RESPONSE);
          const integration = createMockSigninOAuthNativeIntegration({
            isMobile: true,
          });
          render({
            beginSigninHandler: jest.fn().mockReturnValue(
              createBeginSigninResponse({
                verified: false,
              })
            ),
            integration,
            finishOAuthFlowHandler,
            sessionToken: MOCK_SESSION_TOKEN,
          });

          enterPasswordAndSubmit();
          await waitFor(() => {
            expect(handleNavigationSpy).toHaveBeenCalledWith(
              expect.objectContaining({
                performNavigation: true,
              })
            );
          });
          handleNavigationSpy.mockRestore();
        });

        it('handles error due to TOTP required or insufficent ARC value', async () => {
          const signinResponse = createBeginSigninResponse();
          const beginSigninHandler = jest
            .fn()
            .mockReturnValueOnce(signinResponse);
          const finishOAuthFlowHandler = jest
            .fn()
            .mockImplementationOnce(() => ({
              error: AuthUiErrors.TOTP_REQUIRED,
            }));
          const integration = createMockSigninOAuthIntegration();
          render({ finishOAuthFlowHandler, integration, beginSigninHandler });

          await enterPasswordAndSubmit();
          await waitFor(() => {
            expect(GleanMetrics.login.submit).toHaveBeenCalledTimes(1);
          });
          expect(GleanMetrics.login.error).toHaveBeenCalledWith({
            event: { reason: AuthUiErrors.TOTP_REQUIRED.message },
          });
          expect(GleanMetrics.login.error).toHaveBeenCalledTimes(1);

          expect(navigate).toHaveBeenCalledWith('/inline_totp_setup', {
            replace: true,
            state: {
              email: MOCK_EMAIL,
              keyFetchToken: signinResponse.data.signIn.keyFetchToken,
              sessionToken: signinResponse.data.signIn.sessionToken,
              uid: signinResponse.data.signIn.uid,
              unwrapBKey: signinResponse.data.unwrapBKey,
              verificationMethod: signinResponse.data.signIn.verificationMethod,
              verificationReason: signinResponse.data.signIn.verificationReason,
              verified: signinResponse.data.signIn.verified,
            },
          });
        });

        it('navigates to /inline_totp_setup when RP requires two-step auth and session is verified', async () => {
          const signinResponse = createBeginSigninResponse({ verified: true });
          const beginSigninHandler = jest
            .fn()
            .mockReturnValueOnce(signinResponse);
          const finishOAuthFlowHandler = jest
            .fn()
            .mockImplementationOnce(() => ({
              error: AuthUiErrors.TOTP_REQUIRED,
            }));
          const integration = createMockSigninOAuthIntegration();
          // Make the RP explicitly request AAL2
          (integration.wantsTwoStepAuthentication as unknown as
            | jest.Mock
            | undefined) = undefined;
          integration.wantsTwoStepAuthentication = () => true;

          render({ finishOAuthFlowHandler, integration, beginSigninHandler });

          await enterPasswordAndSubmit();
          await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith('/inline_totp_setup', {
              replace: true,
              state: {
                email: MOCK_EMAIL,
                keyFetchToken: signinResponse.data.signIn.keyFetchToken,
                sessionToken: signinResponse.data.signIn.sessionToken,
                uid: signinResponse.data.signIn.uid,
                unwrapBKey: signinResponse.data.unwrapBKey,
                verificationMethod:
                  signinResponse.data.signIn.verificationMethod,
                verificationReason:
                  signinResponse.data.signIn.verificationReason,
                verified: signinResponse.data.signIn.verified,
              },
            });
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

        await submit();
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

        await submit();
        await waitFor(() => {
          screen.getByText(unexpectedError.message);
          passwordInputNotRendered();
        });
      });
    });

    describe('user does not have a password', () => {
      it('renders as expected without linked account', () => {
        renderWithLocalizationProvider(
          <Subject sessionToken={MOCK_SESSION_TOKEN} hasPassword={false} />
        );

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
        renderWithLocalizationProvider(
          <Subject
            sessionToken={MOCK_SESSION_TOKEN}
            hasPassword={false}
            hasLinkedAccount={true}
          />
        );
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

  describe('hardNavigate', () => {
    let hardNavigateSpy: jest.SpyInstance;

    beforeEach(() => {
      hardNavigateSpy = jest
        .spyOn(utils, 'hardNavigate')
        .mockImplementation(() => {});
    });
    afterEach(() => {
      hardNavigateSpy.mockRestore();
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
      await waitFor(() => {
        expect(GleanMetrics.login.diffAccountLinkClick).toHaveBeenCalledTimes(
          1
        );
      });
      expect(mockNavigate).toHaveBeenCalledWith('/?', {
        state: { prefillEmail: MOCK_EMAIL },
      });
    });
  });

  describe('when client is Pocket', () => {
    it('shows Pocket in header', () => {
      renderWithLocalizationProvider(
        <Subject
          sessionToken={MOCK_SESSION_TOKEN}
          serviceName={MozServices.Pocket}
          integration={createMockSigninOAuthIntegration({
            clientId: POCKET_CLIENTIDS[0],
            service: MozServices.Pocket,
            wantsKeys: false,
          })}
        />
      );

      const pocketLogo = screen.getByAltText('Pocket');
      expect(pocketLogo).toBeInTheDocument();
    });

    it('shows Pocket-specific TOS', () => {
      renderWithLocalizationProvider(
        <Subject
          integration={createMockSigninOAuthIntegration({
            clientId: POCKET_CLIENTIDS[0],
            service: MozServices.Pocket,
          })}
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
          integration={createMockSigninOAuthIntegration({
            clientId: MONITOR_CLIENTIDS[0],
            service: MozServices.Monitor,
          })}
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

  describe('snapshots - CMS', () => {
    // The purpose of these snapshots is to ensure that we've implemented the pass
    // through of CMS data to appropriate components. Because we also have snapshots
    // on the components we don't need to test with cms "off"
    const cmsProps = {
      cmsInfo: {
        shared: {
          logoUrl: 'https://example.com/SNAPSHOT_TEST.png',
          logoAltText: 'SNAPSHOT_TEST Shared Alt text for logo',
          buttonColor: 'blue',
          headerLogoUrl: 'https://example.com/SNAPSHOT_TEST_header.png',
          headerLogoAltText: 'SNAPSHOT_TEST Shared Alt text for header logo',
          pageTitle: 'SNAPSHOT_TEST Shared page title',
          backgroundColor: 'yellow',
          favicon: 'https://example.com/SNAPSHOT_TEST_favicon.ico',
        },
        SigninPage: {
          headline: 'SNAPSHOT_TEST Custom CMS Headline',
          description: 'SNAPSHOT_TEST Custom CMS Description',
          primaryButtonText: 'SNAPSHOT_TEST Custom CMS Button Text',
        },
        // these aren't used in the Signin page, but are here to ensure consistency
        name: 'SNAPSHOT_TEST name',
        clientId: 'SNAPSHOT_TEST_clientId',
        entrypoint: 'SNAPSHOT_TEST_entrypoint',
      },
    };

    beforeEach(() => {
      HTMLFormElement.prototype.submit = jest.fn();
    });

    it('sets the shared page title from CMS', () => {
      render({ integration: createMockSigninWebIntegration(cmsProps) });

      expect(document.title).toBe(
        `${cmsProps.cmsInfo.shared.pageTitle} | Mozilla accounts`
      );
    });

    it('sets the shared page title without CMS', () => {
      render({ integration: createMockSigninWebIntegration() });

      expect(document.title).toBe('Mozilla accounts');
    });

    it('renders CardHeader with CMS content when password is needed', () => {
      // This path: isPasswordNeededRef.current && hasPassword === true
      // Renders CardHeader with CMS headline and description
      const props = {
        integration: createMockSigninWebIntegration(cmsProps),
        hasPassword: true,
        sessionToken: undefined,
      };

      render(props);

      // grab the parent element because searching by our test
      // description only returns the <p> tag. Other elements
      // we care about are siblings to the tag.
      const card = screen.getByText(
        cmsProps.cmsInfo.SigninPage.description
      ).parentElement!;

      const cmsLogo = within(card).getByRole('img', {
        name: cmsProps.cmsInfo.shared.logoAltText,
      });
      const cmsHeadline = within(card).getByRole('heading', {
        name: cmsProps.cmsInfo.SigninPage.headline,
      });
      const cmsDescription = within(card).getByText(
        cmsProps.cmsInfo.SigninPage.description
      );

      expect(cmsLogo).toMatchSnapshot('cms logo');
      expect(cmsHeadline).toMatchSnapshot('cms headline');
      expect(cmsDescription).toMatchSnapshot('cms description');
    });

    it('renders CardHeader with CMS content when password is not needed', () => {
      // This path: isPasswordNeededRef.current && hasPassword === false
      // Renders CardHeader with different props but still uses CMS logo
      render({
        integration: createMockSigninWebIntegration(cmsProps),
        hasPassword: false,
      });

      // the specific case here is the falsy condition of the above ternary
      // so, we make sure our mock headline is NOT in the document as a guard against
      // snapshotting the wrong render.
      expect(
        screen.queryByText(cmsProps.cmsInfo.SigninPage.headline)
      ).not.toBeInTheDocument();

      const cmsLogo = screen.getByRole('img', {
        name: cmsProps.cmsInfo.shared.logoAltText,
      });
      expect(cmsLogo).toMatchSnapshot();
    });

    it('renders the CMS-styled submit button', () => {
      render({ integration: createMockSigninWebIntegration(cmsProps) });

      const submitButton = screen.getByRole('button', { name: 'Sign in' });

      expect(submitButton).toMatchSnapshot();
    });

    it('renders AppLayout with CMS header logo', () => {
      render({ integration: createMockSigninWebIntegration(cmsProps) });

      const headerLogo = screen.getByRole('img', {
        name: cmsProps.cmsInfo.shared.headerLogoAltText,
      });

      expect(headerLogo).toMatchSnapshot();
    });
  });
});
