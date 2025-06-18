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
import firefox from '../../lib/channels/firefox';
import GleanMetrics from '../../lib/glean';
import * as utils from 'fxa-react/lib/utils';
import { POCKET_CLIENTIDS } from '../../models/integrations/client-matching';
import { getSyncEngineIds, syncEngineConfigs } from '../../lib/sync-engines';
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

async function fillOutForm(withPwdConfirmation: boolean) {
  fireEvent.input(screen.getByLabelText('Password'), {
    target: { value: MOCK_PASSWORD },
  });
  withPwdConfirmation &&
    fireEvent.input(screen.getByLabelText('Repeat password'), {
      target: { value: MOCK_PASSWORD },
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
      screen.getByRole('heading', { name: 'Create a password' })
    );
    screen.getByRole('link', { name: 'Change email' });
    screen.getByLabelText('Password');
    // password confirmation field required for sync and desktop relay only
    expect(screen.queryByLabelText('Repeat password')).not.toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: 'Create account' })
    ).toBeInTheDocument();
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

    // Password confirmation is required for sync
    expect(screen.getByLabelText('Repeat password')).toBeVisible();

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

    // newsletters and third party auth should not be displayed
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

    await act(async () => {
      await user.type(screen.getByLabelText('Password'), 'a');
    });

    await waitFor(() => {
      expect(GleanMetrics.registration.engage).toBeCalledTimes(1);
      expect(GleanMetrics.registration.engage).toBeCalledWith({
        event: { reason: 'password' },
      });
    });
  });

  it('sets data on sensitive data client', async () => {
    const mockBeginSignupHandler = jest
      .fn()
      .mockResolvedValue(BEGIN_SIGNUP_HANDLER_RESPONSE);
    renderWithLocalizationProvider(
      <Subject beginSignupHandler={mockBeginSignupHandler} />
    );
    await fillOutForm(false);
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

  describe('fails for Relay email masks', () => {
    ['a@relay.firefox.com', 'b@mozmail.com', 'c@sub.mozmail.com'].forEach(
      (mask) => {
        it(`fails for mask ${mask}`, async () => {
          renderWithLocalizationProvider(<Subject email={mask} />);
          await fillOutForm(false);
          submit();

          await waitFor(() => {
            screen.getByText('Email masks can’t be used to create an account.');
          });
        });
      }
    );
  });

  it('emits a metrics event on submit', async () => {
    renderWithLocalizationProvider(<Subject />);
    await fillOutForm(false);
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

      await fillOutForm(false);
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

        it('all sync options selected and sent', async () => {
          await fillOutForm(true);
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
        it('all sync options selected and sent', async () => {
          renderWithLocalizationProvider(
            <Subject
              integration={createMockSignupOAuthNativeIntegration()}
              beginSignupHandler={mockBeginSignupHandler}
            />
          );

          await fillOutForm(true);
          submit();

          await waitFor(() => {
            expect(mockBeginSignupHandler).toHaveBeenCalledWith(
              MOCK_EMAIL,
              MOCK_PASSWORD
            );
          });

          expect(fxaLoginSpy).toHaveBeenCalledWith({
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

        const passwordInput = screen.getByLabelText('Password');
        const repeatPasswordInput = screen.getByLabelText('Repeat password');
        const submitButton = screen.getByRole('button', {
          name: 'Create account',
        });

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
      await fillOutForm(false);
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
      expect(GleanMetrics.registration.marketing).toHaveBeenCalledWith({
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
      await fillOutForm(false);
      submit();

      await waitFor(() => {
        // Does not send services: { sync: {...} }
        expect(fxaLoginSpy).toHaveBeenCalledWith({
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
        expect(GleanMetrics.registration.marketing).not.toHaveBeenCalled();
      });
    });

    it('on fail', async () => {
      const mockBeginSignupHandler = jest
        .fn()
        .mockResolvedValue(BEGIN_SIGNUP_HANDLER_FAIL_RESPONSE);

      renderWithLocalizationProvider(
        <Subject beginSignupHandler={mockBeginSignupHandler} />
      );

      await fillOutForm(false);
      submit();

      await waitFor(() => {
        screen.getByText(AuthUiErrors.UNEXPECTED_ERROR.message);
      });
      expect(GleanMetrics.registration.submit).toHaveBeenCalledTimes(1);
      expect(GleanMetrics.registration.success).not.toHaveBeenCalled();
    });
  });
});
