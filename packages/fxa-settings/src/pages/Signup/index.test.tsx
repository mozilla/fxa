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
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { usePageViewEvent } from '../../lib/metrics';
import { viewName } from '.';
import { REACT_ENTRYPOINT } from '../../constants';
import {
  BEGIN_SIGNUP_HANDLER_FAIL_RESPONSE,
  BEGIN_SIGNUP_HANDLER_RESPONSE,
  Subject,
  createMockSignupOAuthWebIntegration,
  createMockSignupOAuthNativeIntegration,
  createMockSignupSyncDesktopV3Integration,
} from './mocks';
import { MOCK_EMAIL, MOCK_PASSWORD } from '../mocks';
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
import { SensitiveData } from '../../lib/sensitive-data-client';
import { mockSensitiveDataClient as createMockSensitiveDataClient } from '../../models/mocks';
import { useSensitiveDataClient } from '../../models';
import userEvent from '@testing-library/user-event';

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

const mockNavigate = jest.fn();
jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useNavigate: () => mockNavigate,
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
      marketing: jest.fn(),
      changeEmail: jest.fn(),
      whyWeAsk: jest.fn(),
    },
    isDone: jest.fn(),
  },
}));

jest.mock('../../models', () => {
  return {
    ...jest.requireActual('../../models'),
    useSensitiveDataClient: jest.fn(),
  };
});

const mockSensitiveDataClient = createMockSensitiveDataClient();
mockSensitiveDataClient.setDataType = jest.fn();

const oauthCommonFxaLoginOptions = {
  email: MOCK_EMAIL,
  sessionToken: BEGIN_SIGNUP_HANDLER_RESPONSE.data.signUp.sessionToken,
  uid: BEGIN_SIGNUP_HANDLER_RESPONSE.data.signUp.uid,
  verified: false,
};

const commonFxaLoginOptions = {
  ...oauthCommonFxaLoginOptions,
  keyFetchToken: BEGIN_SIGNUP_HANDLER_RESPONSE.data.signUp.keyFetchToken,
  unwrapBKey: BEGIN_SIGNUP_HANDLER_RESPONSE.data.unwrapBKey,
};

async function fillOutForm(age: string, withPwdConfirmation: boolean) {
  const ageInput = screen.getByLabelText('How old are you?');

  fireEvent.input(screen.getByLabelText('Password'), {
    target: { value: MOCK_PASSWORD },
  });
  withPwdConfirmation &&
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

const user = userEvent.setup();

// Note: we are removing the password confirmation requirement for signup
// except for Sync (in in FXA-10467). All tests by default will assume that
// password confirmation is not present or required except for Sync/Desktop Relay.

describe('Signup page', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    cleanup();

    (useSensitiveDataClient as jest.Mock).mockImplementation(
      () => mockSensitiveDataClient
    );
  });

  it('renders as expected for web integration', async () => {
    renderWithLocalizationProvider(<Subject />);

    await waitFor(() =>
      screen.getByRole('heading', { name: 'Set your password' })
    );
    screen.getByRole('link', { name: 'Change email' });
    screen.getByLabelText('Password');
    // password confirmation field required for sync and desktop relay only
    expect(screen.queryByLabelText('Repeat password')).not.toBeInTheDocument();
    screen.getByLabelText('How old are you?');
    screen.getByRole('link', { name: /Why do we ask/ });

    // newsletter options are shown by default
    await waitFor(() => screen.getByText('Get more from Mozilla:'));
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(3);

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

  it('shows an info banner and Pocket-specific TOS when client is Pocket', async () => {
    renderWithLocalizationProvider(
      <Subject
        integration={createMockSignupOAuthWebIntegration(POCKET_CLIENTIDS[0])}
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
      name: 'Close banner',
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
    // Password confirmation is required for sync
    expect(screen.getByLabelText('Repeat password')).toBeVisible();
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

  it('renders as expected when service=relay', async () => {
    renderWithLocalizationProvider(
      <Subject
        integration={createMockSignupOAuthNativeIntegration('relay', false)}
      />
    );

    expect(screen.queryByLabelText('Repeat password')).not.toBeInTheDocument();

    // CWTS, newsletters, and third party auth should not be displayed
    await waitFor(() =>
      expect(screen.queryByText('Choose what to sync')).not.toBeInTheDocument()
    );
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
    expect(
      screen.queryByRole('button', { name: /Continue with Google/ })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Continue with Apple/ })
    ).not.toBeInTheDocument();

    screen.getByRole('heading', { name: 'Create a password' });
    screen.getByText(
      'A password is needed to securely manage your masked emails and access Mozilla’s security tools.'
    );
  });

  describe('email change', () => {
    let hardNavigateSpy: jest.SpyInstance;

    beforeEach(() => {
      hardNavigateSpy = jest
        .spyOn(utils, 'hardNavigate')
        .mockImplementation(() => {});
    });
    afterEach(() => {
      hardNavigateSpy.mockRestore();
    });

    it('is allowed', async () => {
      renderWithLocalizationProvider(<Subject />);

      await waitFor(() => {
        fireEvent.click(
          screen.getByRole('link', {
            name: 'Change email',
          })
        );
      });
      await waitFor(() => {
        expect(GleanMetrics.registration.changeEmail).toBeCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith('/', {
          state: { prefillEmail: MOCK_EMAIL },
        });
      });
    });
  });

  it('emits metrics events', async () => {
    renderWithLocalizationProvider(<Subject />);

    await waitFor(() => {
      expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
      expect(GleanMetrics.registration.view).toBeCalledTimes(1);
    });

    fireEvent.focus(screen.getByLabelText('Password'));
    fireEvent.focus(screen.getByLabelText('How old are you?'));
    fireEvent.click(screen.getByRole('link', { name: /Why do we ask/ }));

    await waitFor(() => {
      expect(GleanMetrics.registration.engage).toBeCalledTimes(2);
      expect(GleanMetrics.registration.engage).toBeCalledWith({
        event: { reason: 'password' },
      });
      expect(GleanMetrics.registration.engage).toBeCalledWith({
        event: { reason: 'age' },
      });
      expect(GleanMetrics.registration.whyWeAsk).toBeCalledTimes(1);
    });
  });

  it('sets data on sensitive data client', async () => {
    const mockBeginSignupHandler = jest
      .fn()
      .mockResolvedValue(BEGIN_SIGNUP_HANDLER_RESPONSE);
    renderWithLocalizationProvider(
      <Subject beginSignupHandler={mockBeginSignupHandler} />
    );
    await fillOutForm('18', false);
    submit();
    await waitFor(() => {
      expect(mockSensitiveDataClient.setDataType).toHaveBeenCalledWith(
        SensitiveData.Key.Auth,
        {
          keyFetchToken:
            BEGIN_SIGNUP_HANDLER_RESPONSE.data.signUp.keyFetchToken,
          unwrapBKey: BEGIN_SIGNUP_HANDLER_RESPONSE.data.unwrapBKey,
        }
      );
    });
  });

  describe('age check', () => {
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
      jest.spyOn(document, 'cookie', 'get').mockImplementation(() => cookieJar);
      expect(document.cookie).toBe('');

      const mockBeginSignupHandler = jest.fn();
      renderWithLocalizationProvider(
        <Subject beginSignupHandler={mockBeginSignupHandler} />
      );
      await fillOutForm('12', false);

      submit();
      await waitFor(() => {
        expect(document.cookie).toBe('tooyoung=1;');
      });
      expect(GleanMetrics.registration.submit).toHaveBeenCalledTimes(1);
      expect(GleanMetrics.registration.success).not.toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/cannot_create_account');
      expect(mockBeginSignupHandler).not.toBeCalled();
    });

    it('with age set over 130, does not submit and displays error', async () => {
      const mockBeginSignupHandler = jest.fn();
      renderWithLocalizationProvider(
        <Subject beginSignupHandler={mockBeginSignupHandler} />
      );
      await fillOutForm('131', false);

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
          renderWithLocalizationProvider(<Subject email={mask} />);
          await fillOutForm('18', false);
          submit();

          await waitFor(() => {
            screen.getByText('Email masks can’t be used to create an account.');
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
    await fillOutForm('18', false);

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
      // expect glean metrics to fire
      expect(GleanMetrics.registration.marketing).toBeCalledWith({
        standard: {
          marketing: {
            news: true,
            take_action: true,
            testing: true,
          },
        },
      });

      // expect navigation to have been called with newsletter slugs
      expect(mockNavigate).toHaveBeenCalledWith(`/confirm_signup_code`, {
        state: {
          origin: 'signup',
          // we expect three newsletter options, but 4 slugs should be passed
          // because the first newsletter checkbox subscribes the user to 2 newsletters
          selectedNewsletterSlugs: [
            'mozilla-and-you',
            'mozilla-accounts',
            'mozilla-foundation',
            'test-pilot',
          ],
        },
        replace: true,
      });
    });
  });

  it('emits a metrics event on submit', async () => {
    renderWithLocalizationProvider(<Subject />);
    await fillOutForm('18', false);
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

      await fillOutForm('18', false);
      submit();

      await waitFor(() => {
        expect(mockBeginSignupHandler).toHaveBeenCalledWith(
          MOCK_EMAIL,
          MOCK_PASSWORD
        );
      });

      expect(fxaLoginSpy).not.toBeCalled();
      expect(GleanMetrics.registration.success).toHaveBeenCalledTimes(1);

      expect(mockNavigate).toHaveBeenCalledWith(`/confirm_signup_code`, {
        state: {
          origin: 'signup',
          selectedNewsletterSlugs: [],
        },
        replace: true,
      });
    });

    describe('Sync integrations', () => {
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
          await fillOutForm('18', true);
          submit();

          await waitFor(() => {
            expect(mockBeginSignupHandler).toHaveBeenCalledWith(
              MOCK_EMAIL,
              MOCK_PASSWORD
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
            expect(GleanMetrics.registration.marketing).toHaveBeenCalledTimes(
              0
            );
          });
          expect(GleanMetrics.registration.cwts).toHaveBeenCalledWith({
            sync: {
              cwts: offeredEngines.reduce(
                (acc, engine) => {
                  acc[engine] = true;
                  return acc;
                },
                {} as Record<string, boolean>
              ),
            },
          });
        });
      });

      describe('on success with OAuthNative integration with Sync', () => {
        it('all CWTS options selected (default)', async () => {
          renderWithLocalizationProvider(
            <Subject
              integration={createMockSignupOAuthNativeIntegration()}
              beginSignupHandler={mockBeginSignupHandler}
            />
          );

          await fillOutForm('18', true);
          submit();

          await waitFor(() => {
            expect(mockBeginSignupHandler).toHaveBeenCalledWith(
              MOCK_EMAIL,
              MOCK_PASSWORD
            );
          });

          expect(fxaLoginSpy).toBeCalledWith({
            ...oauthCommonFxaLoginOptions,
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
          renderWithLocalizationProvider(
            <Subject
              integration={createMockSignupOAuthNativeIntegration()}
              beginSignupHandler={mockBeginSignupHandler}
            />
          );

          await fillOutForm('18', true);

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
              MOCK_PASSWORD
            );
          });

          expect(fxaLoginSpy).toBeCalledWith({
            ...oauthCommonFxaLoginOptions,
            services: {
              sync: {
                declinedEngines: ['prefs', 'bookmarks'],
                offeredEngines,
              },
            },
          });

          await waitFor(() => {
            expect(GleanMetrics.registration.marketing).toBeCalledTimes(0);
            expect(GleanMetrics.registration.cwts).toHaveBeenCalledWith({
              sync: {
                cwts: {
                  ...offeredEngines.reduce(
                    (acc, engine) => {
                      acc[engine] = true;
                      return acc;
                    },
                    {} as Record<string, boolean>
                  ),
                  prefs: false,
                  bookmarks: false,
                },
              },
            });
          });
        });

        it('zero CWTS options selected', async () => {
          renderWithLocalizationProvider(
            <Subject
              integration={createMockSignupOAuthNativeIntegration()}
              beginSignupHandler={mockBeginSignupHandler}
            />
          );
          await fillOutForm('18', true);

          act(() => {
            syncEngineConfigs.forEach((engineConfig) => {
              fireEvent.click(screen.getByText(engineConfig.text));
            });
          });
          submit();

          await waitFor(() => {
            expect(mockBeginSignupHandler).toHaveBeenCalledWith(
              MOCK_EMAIL,
              MOCK_PASSWORD
            );
          });

          expect(fxaLoginSpy).toBeCalledWith({
            ...oauthCommonFxaLoginOptions,
            services: {
              sync: {
                declinedEngines: offeredEngines,
                offeredEngines,
              },
            },
          });

          await waitFor(() => {
            expect(GleanMetrics.registration.marketing).toBeCalledTimes(0);
            expect(GleanMetrics.registration.cwts).toHaveBeenCalledWith({
              sync: {
                cwts: offeredEngines.reduce(
                  (acc, engine) => {
                    acc[engine] = false;
                    return acc;
                  },
                  {} as Record<string, boolean>
                ),
              },
            });
          });
        });
      });

      it('shows error for non matching passwords', async () => {
        renderWithLocalizationProvider(
          <Subject
            integration={createMockSignupOAuthNativeIntegration()}
            beginSignupHandler={mockBeginSignupHandler}
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

      it('allows user to correct password', async () => {
        renderWithLocalizationProvider(
          <Subject
            integration={createMockSignupOAuthNativeIntegration()}
            beginSignupHandler={mockBeginSignupHandler}
          />
        );

        const ageInput = screen.getByLabelText('How old are you?');
        const passwordInput = screen.getByLabelText('Password');
        const repeatPasswordInput = screen.getByLabelText('Repeat password');
        const submitButton = screen.getByRole('button', {
          name: 'Create account',
        });

        await user.type(ageInput, '13');
        await user.type(passwordInput, MOCK_PASSWORD);
        await user.type(repeatPasswordInput, MOCK_PASSWORD + 'x');

        await waitFor(() => expect(submitButton).toBeDisabled());

        // fix by correcting first password field
        await user.type(passwordInput, 'x');
        await waitFor(() => expect(submitButton).toBeEnabled());

        await user.clear(passwordInput);
        await user.type(passwordInput, MOCK_PASSWORD);
        expect(passwordInput).toHaveValue(MOCK_PASSWORD);

        await waitFor(() => expect(submitButton).toBeDisabled());

        // // fix by correcting second password field
        await user.clear(repeatPasswordInput);
        await user.type(repeatPasswordInput, MOCK_PASSWORD);
        await waitFor(() => expect(submitButton).toBeEnabled());
      });
    });

    it('on success with OAuth Web integration', async () => {
      const mockBeginSignupHandler = jest
        .fn()
        .mockResolvedValue(BEGIN_SIGNUP_HANDLER_RESPONSE);

      renderWithLocalizationProvider(
        <Subject
          integration={createMockSignupOAuthWebIntegration()}
          beginSignupHandler={mockBeginSignupHandler}
        />
      );
      await fillOutForm('18', false);
      submit();

      expect(fxaLoginSpy).not.toBeCalled();

      await waitFor(() => {
        expect(mockBeginSignupHandler).toHaveBeenCalledWith(
          MOCK_EMAIL,
          MOCK_PASSWORD
        );
      });
      expect(GleanMetrics.registration.cwts).toHaveBeenCalledTimes(0);
      expect(GleanMetrics.registration.success).toHaveBeenCalledTimes(1);
      expect(GleanMetrics.registration.marketing).toBeCalledWith({
        standard: {
          marketing: {
            news: false,
            take_action: false,
            testing: false,
          },
        },
      });
    });

    it('on success with OAuth Native integration, service=relay', async () => {
      const mockBeginSignupHandler = jest
        .fn()
        .mockResolvedValue(BEGIN_SIGNUP_HANDLER_RESPONSE);

      renderWithLocalizationProvider(
        <Subject
          integration={createMockSignupOAuthNativeIntegration('relay', false)}
          beginSignupHandler={mockBeginSignupHandler}
        />
      );
      await fillOutForm('18', false);
      submit();

      await waitFor(() => {
        // Does not send services: { sync: {...} }
        expect(fxaLoginSpy).toBeCalledWith({
          ...oauthCommonFxaLoginOptions,
          services: { relay: {} },
        });
      });

      await waitFor(() => {
        expect(mockBeginSignupHandler).toHaveBeenCalledWith(
          MOCK_EMAIL,
          MOCK_PASSWORD
        );
        expect(GleanMetrics.registration.cwts).toHaveBeenCalledTimes(0);
        expect(GleanMetrics.registration.success).toHaveBeenCalledTimes(1);
        expect(GleanMetrics.registration.marketing).not.toBeCalled();
      });
    });

    it('on fail', async () => {
      const mockBeginSignupHandler = jest
        .fn()
        .mockResolvedValue(BEGIN_SIGNUP_HANDLER_FAIL_RESPONSE);

      renderWithLocalizationProvider(
        <Subject beginSignupHandler={mockBeginSignupHandler} />
      );

      await fillOutForm('18', false);
      submit();

      await waitFor(() => {
        screen.getByText(AuthUiErrors.UNEXPECTED_ERROR.message);
      });
      expect(GleanMetrics.registration.submit).toHaveBeenCalledTimes(1);
      expect(GleanMetrics.registration.success).not.toHaveBeenCalled();
    });
  });

  describe('handle input errors', () => {
    it('checks coppa is empty', async () => {
      renderWithLocalizationProvider(
        <Subject
          {...{
            email: 'foo@bar.com',
          }}
        />
      );

      const newPasswordInput = screen.getByTestId('new-password-input-field');
      const ageInput = screen.getByTestId('age-input-field');
      const createAccountButton = screen.getByText('Create account');

      fireEvent.change(newPasswordInput, {
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
  });
});
