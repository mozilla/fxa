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
import { MozServices } from '../../lib/types';
import { REACT_ENTRYPOINT } from '../../constants';
import {
  BEGIN_SIGNUP_HANDLER_FAIL_RESPONSE,
  BEGIN_SIGNUP_HANDLER_RESPONSE,
  MOCK_SEARCH_PARAMS,
  Subject,
  createMockSignupOAuthIntegration,
  createMockSignupSyncDesktopIntegration,
} from './mocks';
import {
  MOCK_EMAIL,
  MOCK_KEY_FETCH_TOKEN,
  MOCK_PASSWORD,
  MOCK_SERVICE,
  MOCK_UNWRAP_BKEY,
} from '../mocks';
import { newsletters } from '../../components/ChooseNewsletters/newsletters';
import { notifyFirefoxOfLogin } from '../../lib/channels/helpers';
import GleanMetrics from '../../lib/glean';
import * as utils from 'fxa-react/lib/utils';

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

jest.mock('../../lib/channels/helpers', () => {
  return {
    notifyFirefoxOfLogin: jest.fn(),
  };
});

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
  default: { registration: { view: jest.fn() } },
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
    await screen.findByRole('heading', { name: 'Set your password' });
    screen.getByRole('link', { name: 'Change email' });
    screen.getByLabelText('Password');
    screen.getByLabelText('Repeat password');
    screen.getByLabelText('How old are you?');
    screen.getByRole('link', { name: /Why do we ask/ });
    expect(
      screen.getByRole('button', { name: 'Create account' })
    ).toBeDisabled();
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

    const newPasswordInput = await screen.findByLabelText('Password');

    expect(newPasswordInput).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByTestId('new-password-visibility-toggle'));
    expect(newPasswordInput).toHaveAttribute('type', 'text');
    fireEvent.click(screen.getByTestId('new-password-visibility-toggle'));
    expect(newPasswordInput).toHaveAttribute('type', 'password');
  });

  it('does not allow the user to change their email with oauth integration', async () => {
    renderWithLocalizationProvider(
      <Subject integration={createMockSignupOAuthIntegration()} />
    );

    await waitFor(() => {
      expect(
        screen.queryByRole('link', { name: 'Change email' })
      ).not.toBeInTheDocument();
    });
  });

  it('shows an info banner and Pocket-specific TOS when client is Pocket', async () => {
    renderWithLocalizationProvider(
      <Subject
        integration={createMockSignupOAuthIntegration(MozServices.Pocket)}
      />
    );

    const infoBannerLink = await screen.findByRole('link', {
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

  it('shows options to choose what to sync when CWTS is enabled', async () => {
    renderWithLocalizationProvider(
      <Subject integration={createMockSignupSyncDesktopIntegration()} />
    );

    await screen.findByText('Choose what to sync');

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(8);
  });

  it('renders and handles newsletters', async () => {
    renderWithLocalizationProvider(<Subject />);

    await screen.findByText('Get more from Mozilla:');

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(3);
  });

  it('emits a metrics event on render', async () => {
    renderWithLocalizationProvider(<Subject />);

    await waitFor(() => {
      expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
      expect(GleanMetrics.registration.view).toBeCalledTimes(1);
    });
  });

  describe('handles submission', () => {
    async function fillOutForm(age = '13') {
      const passwordInput = await screen.findByLabelText('Password');
      const repeatPasswordInput = screen.getByLabelText('Repeat password');
      const ageInput = screen.getByLabelText('How old are you?');

      fireEvent.input(screen.getByLabelText('Password'), {
        target: { value: MOCK_PASSWORD },
      });
      fireEvent.blur(passwordInput);
      fireEvent.input(screen.getByLabelText('Repeat password'), {
        target: { value: MOCK_PASSWORD },
      });
      fireEvent.blur(repeatPasswordInput);
      fireEvent.input(ageInput, {
        target: { value: age },
      });
      fireEvent.blur(ageInput);

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
        expect(mockNavigate).toHaveBeenCalledWith('/cannot_create_account');
        expect(mockBeginSignupHandler).not.toBeCalled();
      });
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
              // we expect three newsletter options, but 4 slugs should be passed
              // because the first newsletter checkbox subscribes the user to 2 newsletters
              selectedNewsletterSlugs: [
                'security-privacy-news',
                'mozilla-accounts',
                'test-pilot',
                'take-action-for-the-internet',
              ],
              unwrapBKey: MOCK_UNWRAP_BKEY,
            },
            replace: true,
          }
        );
      });
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
          {}
        );
      });

      expect(notifyFirefoxOfLogin).not.toBeCalled();

      expect(mockNavigate).toHaveBeenCalledWith(
        `/confirm_signup_code${mockLocation().search}`,
        {
          state: {
            keyFetchToken: MOCK_KEY_FETCH_TOKEN,
            selectedNewsletterSlugs: [],
            unwrapBKey: MOCK_UNWRAP_BKEY,
          },
          replace: true,
        }
      );
    });

    it('on success with Sync integration', async () => {
      const mockBeginSignupHandler = jest
        .fn()
        .mockResolvedValue(BEGIN_SIGNUP_HANDLER_RESPONSE);
      renderWithLocalizationProvider(
        <Subject
          integration={createMockSignupSyncDesktopIntegration()}
          beginSignupHandler={mockBeginSignupHandler}
        />
      );

      await fillOutForm();
      // TODO: CWTS, FXA-8287 (probably need tests for none/all selected)
      submit();

      await waitFor(() => {
        expect(mockBeginSignupHandler).toHaveBeenCalledWith(
          MOCK_EMAIL,
          MOCK_PASSWORD,
          { service: MozServices.FirefoxSync }
        );
      });

      expect(notifyFirefoxOfLogin).toBeCalledWith({
        authAt: BEGIN_SIGNUP_HANDLER_RESPONSE.data.SignUp.authAt,
        email: MOCK_EMAIL,
        keyFetchToken: BEGIN_SIGNUP_HANDLER_RESPONSE.data.SignUp.keyFetchToken,
        sessionToken: BEGIN_SIGNUP_HANDLER_RESPONSE.data.SignUp.sessionToken,
        uid: BEGIN_SIGNUP_HANDLER_RESPONSE.data.SignUp.uid,
        unwrapBKey: BEGIN_SIGNUP_HANDLER_RESPONSE.data.unwrapBKey,
        verified: false,
      });
    });
    it('on success with OAuth integration', async () => {
      const mockBeginSignupHandler = jest
        .fn()
        .mockResolvedValue(BEGIN_SIGNUP_HANDLER_RESPONSE);

      renderWithLocalizationProvider(
        <Subject
          integration={createMockSignupOAuthIntegration()}
          beginSignupHandler={mockBeginSignupHandler}
        />
      );
      await fillOutForm();
      submit();

      expect(notifyFirefoxOfLogin).not.toBeCalled();

      await waitFor(() => {
        expect(mockBeginSignupHandler).toHaveBeenCalledWith(
          MOCK_EMAIL,
          MOCK_PASSWORD,
          { service: MOCK_SERVICE }
        );
      });
      // TODO: other tests here in OAuth ticket (FXA-6519)
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

      await screen.findByText(BEGIN_SIGNUP_HANDLER_FAIL_RESPONSE.error.message);
    });
  });
});
