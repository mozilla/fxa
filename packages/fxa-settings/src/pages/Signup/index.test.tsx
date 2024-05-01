/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import {
  act,
  cleanup,
  fireEvent,
  screen,
  waitFor,
} from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider'; // import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';
import { usePageViewEvent } from '../../lib/metrics';
import { viewName } from '.';
import { REACT_ENTRYPOINT } from '../../constants';
import {
  BEGIN_SIGNUP_HANDLER_FAIL_RESPONSE,
  BEGIN_SIGNUP_HANDLER_RESPONSE,
  MOCK_SEARCH_PARAMS,
  Subject,
  createMockSignupOAuthIntegration,
  createMockSignupSyncDesktopV3Integration,
} from './mocks';
import {
  MOCK_CLIENT_ID,
  MOCK_EMAIL,
  MOCK_KEY_FETCH_TOKEN,
  MOCK_PASSWORD,
  MOCK_UNWRAP_BKEY,
} from '../mocks';
import { newsletters } from '../../components/ChooseNewsletters/newsletters';
import firefox from '../../lib/channels/firefox';
import GleanMetrics from '../../lib/glean';
import * as utils from 'fxa-react/lib/utils';
import { POCKET_CLIENTIDS } from '../../models/integrations/client-matching';
import {
  getSyncEngineIds,
  syncEngineConfigs,
} from '../../components/ChooseWhatToSync/sync-engines';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';

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

const mockLocation = () => {
  return {
    pathname: `/signup`,
    search: '?' + new URLSearchParams(MOCK_SEARCH_PARAMS),
  };
};

const mockNavigate = jest.fn();
jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation(),
}));

jest.mock('../../lib/glean', () => ({
  __esModule: true,
  default: {
    registration: {
      view: jest.fn(),
      engage: jest.fn(),
      submit: jest.fn(),
      success: jest.fn(),
      cwts: jest.fn(),
    },
  },
}));

describe('Signup page', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    cleanup();
  });
  // TODO: enable l10n tests when they've been updated to handle embedded tags in ftl strings
  // TODO: in FXA-6461
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });

  it('renders as expected', async () => {
    renderWithLocalizationProvider(<Subject />);

    // testAllL10n(screen, bundle);
    await waitFor(() =>
      screen.getByRole('heading', { name: 'Set your password' })
    );
    screen.getByRole('link', { name: 'Change email' });
    screen.getByLabelText('Password');
    screen.getByLabelText('Repeat password');
    screen.getByLabelText('How old are you?');
    screen.getByRole('link', { name: /Why do we ask/ });
    expect(
      screen.getByRole('button', { name: 'Create account' })
    ).toBeDisabled();
    // Third party auth options
    expect(
      screen.getByRole('button', { name: /Continue with Google/ })
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: /Continue with Apple/ })
    ).toBeVisible();
    const firefoxTermsLink: HTMLElement = screen.getByRole('link', {
      name: 'Terms of Service',
    });
    const firefoxPrivacyLink: HTMLElement = screen.getByRole('link', {
      name: 'Privacy Notice',
    });
    // Checkboxes have their own test
    expect(firefoxTermsLink).toHaveAttribute('href', '/legal/terms');
    expect(firefoxPrivacyLink).toHaveAttribute('href', '/legal/privacy');
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

    it('allows users to change their email', async () => {
      renderWithLocalizationProvider(<Subject />);

      await waitFor(() => {
        fireEvent.click(
          screen.getByRole('link', {
            name: 'Change email',
          })
        );
      });
      expect(hardNavigateToContentServerSpy).toHaveBeenCalledWith(
        `/?prefillEmail=${encodeURIComponent(MOCK_EMAIL)}`
      );
    });
  });

  it('allows users to show and hide password input', async () => {
    renderWithLocalizationProvider(<Subject />);

    const newPasswordInput = screen.getByLabelText('Password');

    await waitFor(() => {
      expect(newPasswordInput).toHaveAttribute('type', 'password');
    });
    expect(newPasswordInput).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByTestId('new-password-visibility-toggle'));
    expect(newPasswordInput).toHaveAttribute('type', 'text');
    fireEvent.click(screen.getByTestId('new-password-visibility-toggle'));
    expect(newPasswordInput).toHaveAttribute('type', 'password');
  });

  it('shows an info banner and Pocket-specific TOS when client is Pocket', async () => {
    renderWithLocalizationProvider(
      <Subject
        integration={createMockSignupOAuthIntegration(POCKET_CLIENTIDS[0])}
      />
    );

    const infoBannerLink = screen.getByRole('link', {
      name: /Find out here/,
    });
    await waitFor(() => {
      expect(infoBannerLink).toBeInTheDocument();
    });

    // info banner is dismissible
    const infoBannerDismissButton = screen.getByRole('button', {
      name: 'Close',
    });
    fireEvent.click(infoBannerDismissButton);
    await waitFor(() => {
      expect(infoBannerLink).not.toBeInTheDocument();
    });

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

  it('renders as expected when integration is sync', async () => {
    renderWithLocalizationProvider(
      <Subject integration={createMockSignupSyncDesktopV3Integration()} />
    );

    // Choose what to sync options should be displayed if integration is sync
    await waitFor(() => screen.getByText('Choose what to sync'));
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(8);

    // Third party auth options are not offered if integration is Sync
    expect(
      screen.queryByRole('button', { name: /Continue with Google/ })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Continue with Apple/ })
    ).not.toBeInTheDocument();
  });

  it('renders and handles newsletters', async () => {
    renderWithLocalizationProvider(<Subject />);

    await waitFor(() => screen.getByText('Get more from Mozilla:'));

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(3);
  });

  it('emits metrics events', async () => {
    renderWithLocalizationProvider(<Subject />);

    await waitFor(() => {
      expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
      expect(GleanMetrics.registration.view).toBeCalledTimes(1);
    });

    fireEvent.focus(screen.getByLabelText('Password'));
    fireEvent.focus(screen.getByLabelText('How old are you?'));

    await waitFor(() => {
      expect(GleanMetrics.registration.engage).toBeCalledTimes(2);
      expect(GleanMetrics.registration.engage).toBeCalledWith({
        event: { reason: 'password' },
      });
      expect(GleanMetrics.registration.engage).toBeCalledWith({
        event: { reason: 'age' },
      });
    });
  });

  describe('handles submission', () => {
    async function fillOutForm(age = '18') {
      const ageInput = screen.getByLabelText('How old are you?');

      fireEvent.input(screen.getByLabelText('Password'), {
        target: { value: MOCK_PASSWORD },
      });
      fireEvent.input(screen.getByLabelText('Repeat password'), {
        target: { value: MOCK_PASSWORD },
      });
      fireEvent.input(ageInput, {
        target: { value: age },
      });

      await waitFor(() => {
        expect(
          screen.getByRole('button', {
            name: 'Create account',
          })
        ).toBeEnabled();
      });
    }

    function submit() {
      fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    }

    describe('cookies', () => {
      // Clean up cookies to start with a clean slate and avoid polluting other tests.
      const originalCookie = document.cookie;

      beforeAll(() => {
        // @ts-ignore
        delete document.cookie;
        document.cookie = originalCookie;
      });

      beforeEach(() => {
        document.cookie = originalCookie;
      });

      afterEach(() => {
        jest.restoreAllMocks();
      });

      afterAll(() => {
        document.cookie = originalCookie;
      });

      it('with user under 13, adds cookie and redirects', async () => {
        let cookieJar = '';
        jest.spyOn(document, 'cookie', 'set').mockImplementation((cookie) => {
          cookieJar = cookie;
        });
        jest
          .spyOn(document, 'cookie', 'get')
          .mockImplementation(() => cookieJar);
        expect(document.cookie).toBe('');

        const mockBeginSignupHandler = jest.fn();
        renderWithLocalizationProvider(
          <Subject beginSignupHandler={mockBeginSignupHandler} />
        );
        await fillOutForm('12');

        submit();
        await waitFor(() => {
          expect(document.cookie).toBe('tooyoung=1;');
        });
        expect(GleanMetrics.registration.submit).toHaveBeenCalledTimes(1);
        expect(GleanMetrics.registration.success).not.toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/cannot_create_account');
        expect(mockBeginSignupHandler).not.toBeCalled();
      });

      it('with 13 year old user, passes COPPA but atLeast18AtReg marked null', async () => {
        let cookieJar = '';
        jest.spyOn(document, 'cookie', 'set').mockImplementation((cookie) => {
          cookieJar = cookie;
        });
        jest
          .spyOn(document, 'cookie', 'get')
          .mockImplementation(() => cookieJar);
        expect(document.cookie).toBe('');

        const mockBeginSignupHandler = jest
          .fn()
          .mockResolvedValue(BEGIN_SIGNUP_HANDLER_RESPONSE);
        renderWithLocalizationProvider(
          <Subject beginSignupHandler={mockBeginSignupHandler} />
        );
        await fillOutForm('13');

        submit();
        await waitFor(() => {
          expect(document.cookie).not.toBe('tooyoung=1;');
        });
        expect(mockNavigate).not.toHaveBeenCalledWith('/cannot_create_account');
        await waitFor(() => {
          expect(mockBeginSignupHandler).toHaveBeenCalledWith(
            MOCK_EMAIL,
            MOCK_PASSWORD,
            null
          );
        });
      });

      it('with age set over 130, does not submit and displays error', async () => {
        const mockBeginSignupHandler = jest.fn();
        renderWithLocalizationProvider(
          <Subject beginSignupHandler={mockBeginSignupHandler} />
        );
        await fillOutForm('131');

        submit();
        await waitFor(() => {
          expect(screen.getByTestId('tooltip')).toHaveTextContent(
            'You must enter a valid age to sign up'
          );
        });
        expect(GleanMetrics.registration.submit).toHaveBeenCalledTimes(1);
        expect(mockBeginSignupHandler).not.toBeCalled();
      });
    });

    describe('fails for Relay email masks', () => {
      ['a@relay.firefox.com', 'b@mozmail.com', 'c@sub.mozmail.com'].forEach(
        (mask) => {
          it(`fails for mask ${mask}`, async () => {
            renderWithLocalizationProvider(
              <Subject queryParams={{ email: mask }} />
            );
            await fillOutForm();
            submit();

            await waitFor(() => {
              screen.getByText(
                'Email masks can’t be used to create an account.'
              );
            });
          });
        }
      );
    });

    it('passes newsletter subscription options to the next screen', async () => {
      const mockBeginSignupHandler = jest
        .fn()
        .mockResolvedValue(BEGIN_SIGNUP_HANDLER_RESPONSE);

      renderWithLocalizationProvider(
        <Subject beginSignupHandler={mockBeginSignupHandler} />
      );
      await fillOutForm();

      // select all newsletters
      const checkboxes = screen.getAllByRole('checkbox');
      // We expect three newsletter options
      expect(checkboxes).toHaveLength(3);
      act(() => {
        newsletters.forEach((_, i) => {
          fireEvent.click(checkboxes[i]);
        });
      });

      submit();

      await waitFor(() => {
        // expect navigation to have been called with newsletter slugs
        expect(mockNavigate).toHaveBeenCalledWith(
          `/confirm_signup_code${mockLocation().search}`,
          {
            state: {
              keyFetchToken: MOCK_KEY_FETCH_TOKEN,
              origin: 'signup',
              // we expect three newsletter options, but 4 slugs should be passed
              // because the first newsletter checkbox subscribes the user to 2 newsletters
              selectedNewsletterSlugs: [
                'security-privacy-news',
                'mozilla-accounts',
                'test-pilot',
                'mozilla-foundation',
              ],
              unwrapBKey: MOCK_UNWRAP_BKEY,
            },
            replace: true,
          }
        );
      });
    });

    it('emits a metrics event on submit', async () => {
      renderWithLocalizationProvider(<Subject />);
      await fillOutForm();
      submit();

      await waitFor(() => {
        expect(GleanMetrics.registration.submit).toBeCalledTimes(1);
      });
    });

    describe('integrations', () => {
      let fxaLoginSpy: jest.SpyInstance;
      beforeEach(() => {
        fxaLoginSpy = jest.spyOn(firefox, 'fxaLogin');
      });
      it('on success with Web integration', async () => {
        const mockBeginSignupHandler = jest
          .fn()
          .mockResolvedValue(BEGIN_SIGNUP_HANDLER_RESPONSE);

        renderWithLocalizationProvider(
          <Subject beginSignupHandler={mockBeginSignupHandler} />
        );

        await fillOutForm();
        submit();

        await waitFor(() => {
          expect(mockBeginSignupHandler).toHaveBeenCalledWith(
            MOCK_EMAIL,
            MOCK_PASSWORD,
            true
          );
        });

        expect(fxaLoginSpy).not.toBeCalled();
        expect(GleanMetrics.registration.success).toHaveBeenCalledTimes(1);

        expect(mockNavigate).toHaveBeenCalledWith(
          `/confirm_signup_code${mockLocation().search}`,
          {
            state: {
              keyFetchToken: MOCK_KEY_FETCH_TOKEN,
              origin: 'signup',
              selectedNewsletterSlugs: [],
              unwrapBKey: MOCK_UNWRAP_BKEY,
            },
            replace: true,
          }
        );
      });

      describe('Sync integrations', () => {
        const commonFxaLoginOptions = {
          email: MOCK_EMAIL,
          keyFetchToken:
            BEGIN_SIGNUP_HANDLER_RESPONSE.data.signUp.keyFetchToken,
          sessionToken: BEGIN_SIGNUP_HANDLER_RESPONSE.data.signUp.sessionToken,
          uid: BEGIN_SIGNUP_HANDLER_RESPONSE.data.signUp.uid,
          unwrapBKey: BEGIN_SIGNUP_HANDLER_RESPONSE.data.unwrapBKey,
          verified: false,
        };
        const offeredEngines = getSyncEngineIds();

        let mockBeginSignupHandler: jest.Mock;
        beforeEach(() => {
          mockBeginSignupHandler = jest
            .fn()
            .mockResolvedValue(BEGIN_SIGNUP_HANDLER_RESPONSE);
        });

        describe('on success with Sync desktop v3 integration', () => {
          beforeEach(() => {
            renderWithLocalizationProvider(
              <Subject
                integration={createMockSignupSyncDesktopV3Integration()}
                beginSignupHandler={mockBeginSignupHandler}
              />
            );
          });
          it('all CWTS options selected (default)', async () => {
            await fillOutForm();
            submit();

            await waitFor(() => {
              expect(mockBeginSignupHandler).toHaveBeenCalledWith(
                MOCK_EMAIL,
                MOCK_PASSWORD,
                true
              );
            });

            expect(fxaLoginSpy).toBeCalledWith({
              ...commonFxaLoginOptions,
              services: {
                sync: {
                  declinedEngines: [],
                  offeredEngines,
                },
              },
            });
            expect(GleanMetrics.registration.success).toHaveBeenCalledTimes(1);
            await waitFor(() => {
              expect(GleanMetrics.registration.cwts).toHaveBeenCalledWith({
                sync: {
                  cwts: offeredEngines.reduce((acc, engine) => {
                    acc[engine] = true;
                    return acc;
                  }, {} as Record<string, boolean>),
                },
              });
            });
          });
        });

        describe('on success with Sync OAuth integration', () => {
          beforeEach(() => {
            renderWithLocalizationProvider(
              <Subject
                integration={createMockSignupOAuthIntegration('', true)}
                beginSignupHandler={mockBeginSignupHandler}
              />
            );
          });
          it('all CWTS options selected (default)', async () => {
            await fillOutForm();
            submit();

            await waitFor(() => {
              expect(mockBeginSignupHandler).toHaveBeenCalledWith(
                MOCK_EMAIL,
                MOCK_PASSWORD,
                true
              );
            });

            expect(fxaLoginSpy).toBeCalledWith({
              ...commonFxaLoginOptions,
              services: {
                sync: {
                  declinedEngines: [],
                  offeredEngines,
                },
              },
            });
            expect(GleanMetrics.registration.success).toHaveBeenCalledTimes(1);
          });
          it('some CWTS options selected', async () => {
            await fillOutForm();

            // deselect
            fireEvent.click(screen.getByText('Open Tabs'));
            fireEvent.click(screen.getByText('Preferences'));
            fireEvent.click(screen.getByText('Bookmarks'));
            // reselect
            fireEvent.click(screen.getByText('Open Tabs'));

            submit();

            await waitFor(() => {
              expect(mockBeginSignupHandler).toHaveBeenCalledWith(
                MOCK_EMAIL,
                MOCK_PASSWORD,
                true
              );
            });

            expect(fxaLoginSpy).toBeCalledWith({
              ...commonFxaLoginOptions,
              services: {
                sync: {
                  declinedEngines: ['prefs', 'bookmarks'],
                  offeredEngines,
                },
              },
            });

            await waitFor(() => {
              expect(GleanMetrics.registration.cwts).toHaveBeenCalledWith({
                sync: {
                  cwts: {
                    ...offeredEngines.reduce((acc, engine) => {
                      acc[engine] = true;
                      return acc;
                    }, {} as Record<string, boolean>),
                    prefs: false,
                    bookmarks: false,
                  },
                },
              });
            });
          });
          it('zero CWTS options selected', async () => {
            await fillOutForm();

            act(() => {
              syncEngineConfigs.forEach((engineConfig) => {
                fireEvent.click(screen.getByText(engineConfig.text));
              });
            });
            submit();

            await waitFor(() => {
              expect(mockBeginSignupHandler).toHaveBeenCalledWith(
                MOCK_EMAIL,
                MOCK_PASSWORD,
                true
              );
            });

            expect(fxaLoginSpy).toBeCalledWith({
              ...commonFxaLoginOptions,
              services: {
                sync: {
                  declinedEngines: offeredEngines,
                  offeredEngines,
                },
              },
            });

            await waitFor(() => {
              expect(GleanMetrics.registration.cwts).toHaveBeenCalledWith({
                sync: {
                  cwts: offeredEngines.reduce((acc, engine) => {
                    acc[engine] = false;
                    return acc;
                  }, {} as Record<string, boolean>),
                },
              });
            });
          });
        });
      });

      it('on success with OAuth integration', async () => {
        const mockBeginSignupHandler = jest
          .fn()
          .mockResolvedValue(BEGIN_SIGNUP_HANDLER_RESPONSE);

        renderWithLocalizationProvider(
          <Subject
            integration={createMockSignupOAuthIntegration(MOCK_CLIENT_ID)}
            beginSignupHandler={mockBeginSignupHandler}
          />
        );
        await fillOutForm();
        submit();

        expect(fxaLoginSpy).not.toBeCalled();

        await waitFor(() => {
          expect(mockBeginSignupHandler).toHaveBeenCalledWith(
            MOCK_EMAIL,
            MOCK_PASSWORD,
            true
          );
        });
        expect(GleanMetrics.registration.success).toHaveBeenCalledTimes(1);
      });
    });

    it('on fail', async () => {
      const mockBeginSignupHandler = jest
        .fn()
        .mockResolvedValue(BEGIN_SIGNUP_HANDLER_FAIL_RESPONSE);

      renderWithLocalizationProvider(
        <Subject beginSignupHandler={mockBeginSignupHandler} />
      );

      await fillOutForm();
      submit();

      await waitFor(() => {
        screen.getByText(AuthUiErrors.UNEXPECTED_ERROR.message);
      });
      expect(GleanMetrics.registration.submit).toHaveBeenCalledTimes(1);
      expect(GleanMetrics.registration.success).not.toHaveBeenCalled();
    });

    describe('allows user to correct password', () => {
      beforeEach(async () => {
        const mockBeginSignupHandler = jest
          .fn()
          .mockResolvedValue(BEGIN_SIGNUP_HANDLER_FAIL_RESPONSE);

        renderWithLocalizationProvider(
          <Subject beginSignupHandler={mockBeginSignupHandler} />
        );
        fireEvent.input(screen.getByLabelText('How old are you?'), {
          target: { value: 13 },
        });
        fireEvent.input(screen.getByLabelText('Password'), {
          target: { value: MOCK_PASSWORD },
        });
        fireEvent.input(screen.getByLabelText('Repeat password'), {
          target: { value: MOCK_PASSWORD + 'x' },
        });
        await waitFor(() => {
          expect(
            screen.getByRole('button', {
              name: 'Create account',
            })
          ).toBeDisabled();
        });
      });

      it('enables when password is corrected', async () => {
        fireEvent.input(screen.getByLabelText('Password'), {
          target: { value: MOCK_PASSWORD + 'x' },
        });
        fireEvent.blur(screen.getByLabelText('Password'));
        await waitFor(() => {
          expect(
            screen.getByRole('button', {
              name: 'Create account',
            })
          ).toBeEnabled();
        });
      });

      it('enables when repeat password is corrected', async () => {
        fireEvent.input(screen.getByLabelText('Repeat password'), {
          target: { value: MOCK_PASSWORD },
        });
        fireEvent.blur(screen.getByLabelText('Repeat password'));
        await waitFor(() => {
          expect(
            screen.getByRole('button', {
              name: 'Create account',
            })
          ).toBeEnabled();
        });
      });
    });
  });

  describe('handle input errors', () => {
    it('checks coppa is empty', async () => {
      renderWithLocalizationProvider(
        <Subject
          {...{
            queryParams: {
              email: 'foo@bar.com',
              emailStatusChecked: 'true',
            },
          }}
        />
      );

      const newPasswordInput = screen.getByTestId('new-password-input-field');
      const verifyPasswordInput = screen.getByTestId(
        'verify-password-input-field'
      );
      const ageInput = screen.getByTestId('age-input-field');
      const createAccountButton = screen.getByText('Create account');

      fireEvent.change(newPasswordInput, {
        target: { value: 'bar12345' },
      });
      fireEvent.change(verifyPasswordInput, {
        target: { value: 'bar12345' },
      });
      fireEvent.focus(ageInput);
      fireEvent.blur(ageInput);
      createAccountButton.click();

      await waitFor(() => {
        screen.getByText('You must enter your age to sign up');
      });
      expect(createAccountButton).toBeDisabled();

      // TODO: Make sure only valid values are accepted:
      //  https://mozilla-hub.atlassian.net/browse/FXA-8654
    });

    it('shows error for non matching passwords', async () => {
      renderWithLocalizationProvider(
        <Subject
          {...{
            queryParams: {
              email: 'foo@bar.com',
              emailStatusChecked: 'true',
            },
          }}
        />
      );

      fireEvent.change(screen.getByTestId('new-password-input-field'), {
        target: { value: 'bar12345' },
      });
      fireEvent.change(screen.getByTestId('verify-password-input-field'), {
        target: { value: 'bar12346' },
      });
      fireEvent.blur(screen.getByTestId('verify-password-input-field'));
      await waitFor(() => {
        screen.getByText('Passwords do not match');
      });
    });
  });
});
