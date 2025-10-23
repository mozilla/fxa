/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider'; // import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
import * as ReactUtils from 'fxa-react/lib/utils';
// import { FluentBundle } from '@fluent/bundle';
import { navigate } from '@reach/router';
import { viewName } from '.';
import { REACT_ENTRYPOINT } from '../../../constants';
import VerificationReasons from '../../../constants/verification-reasons';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import GleanMetrics from '../../../lib/glean';
import { usePageViewEvent } from '../../../lib/metrics';
import { AppContext, Session } from '../../../models';
import { mockAppContext, mockSession } from '../../../models/mocks';
import { MOCK_SIGNUP_CODE } from '../../Signup/ConfirmSignupCode/mocks';
import { MOCK_EMAIL, MOCK_OAUTH_FLOW_HANDLER_RESPONSE } from '../../mocks';
import { SigninOAuthIntegration } from '../interfaces';
import {
  createMockSigninOAuthIntegration,
  createMockSigninOAuthNativeSyncIntegration,
  createMockSigninWebIntegration,
} from '../mocks';
import * as SigninUtils from '../utils';
import { SigninTokenCodeProps } from './interfaces';
import { createOAuthNativeIntegration, Subject } from './mocks';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
}));

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {
    loginConfirmation: {
      view: jest.fn(),
      submit: jest.fn(),
      success: jest.fn(),
    },
    isDone: jest.fn(),
  },
}));

function applyDefaultMocks() {
  jest.resetAllMocks();
  jest.restoreAllMocks();

  mockReactUtilsModule();
}

jest.mock('@reach/router', () => {
  return {
    __esModule: true,
    ...jest.requireActual('@reach/router'),
    navigate: jest.fn(),
    useLocation: () => () => {},
  };
});

let session: Session;
function render(
  props: Partial<SigninTokenCodeProps> & {
    verificationReason?: VerificationReasons;
  } = {}
) {
  if (!props.integration) {
    props.integration =
      createMockSigninWebIntegration() as SigninOAuthIntegration;
  }
  renderWithLocalizationProvider(
    <AppContext.Provider value={mockAppContext({ session })}>
      <Subject {...props} />
    </AppContext.Provider>
  );
}

function mockReactUtilsModule() {
  jest.spyOn(ReactUtils, 'hardNavigate').mockImplementation(() => {});
}

const serviceRelayText =
  'Firefox will try sending you back to use an email mask after you sign in.';

describe('SigninTokenCode page', () => {
  beforeEach(() => {
    applyDefaultMocks();
    session = {
      verifySession: jest.fn().mockResolvedValue(true),
      sendVerificationCode: jest.fn().mockResolvedValue(true),
    } as unknown as Session;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // TODO: enable l10n tests when they've been updated to handle embedded tags in ftl strings
  // TODO: in FXA-6461
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });

  it('renders as expected', () => {
    render();
    // testAllL10n(screen, bundle);

    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent(
      'Enter confirmation code for your Mozilla account'
    );
    screen.getByText(
      (_, element) =>
        element?.tagName === 'P' &&
        element?.textContent ===
          `Enter the code that was sent to ${MOCK_EMAIL} within 5 minutes.`
    );
    screen.getByLabelText('Enter 6-digit code');
    screen.getByRole('button', { name: 'Confirm' });
    screen.getByRole('button', { name: 'Email new code.' });

    // initially hidden
    expect(screen.queryByRole('Code expired?')).not.toBeInTheDocument();
    expect(screen.queryByText(serviceRelayText)).not.toBeInTheDocument();
  });

  it('renders expected text when service=relay', () => {
    render({ integration: createOAuthNativeIntegration(false) });
    screen.getByText(serviceRelayText);
  });

  it('emits a metrics event on render', () => {
    render();
    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
    expect(GleanMetrics.loginConfirmation.view).toHaveBeenCalledTimes(1);
  });

  describe('handleResendCode submission', () => {
    async function renderAndResend() {
      render();
      await waitFor(() => {
        screen.getByText('Code expired?');
      });
      fireEvent.click(screen.getByRole('button', { name: 'Email new code.' }));
      await waitFor(() => {
        expect(session.sendVerificationCode).toHaveBeenCalled();
      });
    }
    it('on success, renders banner', async () => {
      session = mockSession();
      await renderAndResend();
      screen.getByText(/A new code was sent to your email./);
    });
    it('on throttled error, renders banner with throttled message', async () => {
      session = {
        sendVerificationCode: jest
          .fn()
          .mockRejectedValue(AuthUiErrors.THROTTLED),
      } as unknown as Session;
      await renderAndResend();
      screen.getByText('You’ve tried too many times. Please try again later.');
    });
    it('on other error, renders banner with expected default error message', async () => {
      session = {
        sendVerificationCode: jest.fn().mockRejectedValue(new Error()),
      } as unknown as Session;
      await renderAndResend();
      screen.getByText('Something went wrong. A new code could not be sent.');
    });
  });

  describe('onSubmit code submission', () => {
    async function submit() {
      const button = screen.getByRole('button', { name: 'Confirm' });
      expect(button).toBeEnabled();
      await userEvent.click(button);
    }
    async function submitCode(code = MOCK_SIGNUP_CODE) {
      const user = userEvent.setup();
      const input = screen.getByLabelText('Enter 6-digit code');
      await user.type(input, code);
      await submit();
    }
    describe('does not submit and displays tooltip', () => {
      beforeEach(() => {
        render();
      });
      it('if no input', async () => {
        const button = screen.getByRole('button', { name: 'Confirm' });
        expect(button).toBeDisabled();

        // Button should be disabled, so clicking it should not trigger submission
        fireEvent.click(button);
        expect(session.verifySession).not.toHaveBeenCalled();
        expect(GleanMetrics.loginConfirmation.submit).not.toHaveBeenCalled();
      });
      // Note, we don't have a test for more than 6 because the input doesn't allow this
      it('if input length is less than 6', async () => {
        // whitespace should get trimmed, so this should be a length of 5
        const user = userEvent.setup();
        const input = screen.getByLabelText('Enter 6-digit code');
        await user.type(input, '12345 ');

        const button = screen.getByRole('button', { name: 'Confirm' });
        expect(button).toBeDisabled();

        // Button should be disabled, so clicking it should not trigger submission
        fireEvent.click(button);
        expect(session.verifySession).not.toHaveBeenCalled();
        expect(GleanMetrics.loginConfirmation.submit).not.toHaveBeenCalled();
      });
      it('if input is not numeric', async () => {
        const user = userEvent.setup();
        const input = screen.getByLabelText('Enter 6-digit code');
        await user.type(input, '1234z5');

        const button = screen.getByRole('button', { name: 'Confirm' });
        expect(button).toBeDisabled();

        // Button should be disabled, so clicking it should not trigger submission
        fireEvent.click(button);
        expect(session.verifySession).not.toHaveBeenCalled();
        expect(GleanMetrics.loginConfirmation.submit).not.toHaveBeenCalled();
      });
      it('if input is scientific notation', async () => {
        const user = userEvent.setup();
        const input = screen.getByLabelText('Enter 6-digit code');
        await user.type(input, '100e10');

        const button = screen.getByRole('button', { name: 'Confirm' });
        expect(button).toBeDisabled();

        // Button should be disabled, so clicking it should not trigger submission
        fireEvent.click(button);
        expect(session.verifySession).not.toHaveBeenCalled();
        expect(GleanMetrics.loginConfirmation.submit).not.toHaveBeenCalled();
      });
    });
    it('on throttled error, renders banner with throttled message', async () => {
      session = {
        verifySession: jest.fn().mockRejectedValue(AuthUiErrors.THROTTLED),
      } as unknown as Session;
      render();
      await submitCode();
      await screen.findByText(
        'You’ve tried too many times. Please try again later.'
      );
      expect(GleanMetrics.loginConfirmation.submit).toHaveBeenCalledTimes(1);
      expect(GleanMetrics.loginConfirmation.success).not.toHaveBeenCalled();
    });
    it('on other error, renders expected default error message in tooltip', async () => {
      session = {
        verifySession: jest
          .fn()
          .mockRejectedValue(AuthUiErrors.INVALID_EXPIRED_OTP_CODE),
      } as unknown as Session;
      render();
      await submitCode();
      expect(await screen.findByTestId('tooltip')).toHaveTextContent(
        'Invalid or expired confirmation code'
      );
      expect(GleanMetrics.loginConfirmation.submit).toHaveBeenCalledTimes(1);
      expect(GleanMetrics.loginConfirmation.success).not.toHaveBeenCalled();
    });

    describe('on success', () => {
      let hardNavigateSpy: jest.SpyInstance;
      beforeEach(() => {
        hardNavigateSpy = jest
          .spyOn(ReactUtils, 'hardNavigate')
          .mockImplementation(() => {});
      });
      afterEach(() => {
        hardNavigateSpy.mockRestore();
      });

      async function expectSuccessGleanEvents() {
        await waitFor(() => {
          expect(GleanMetrics.loginConfirmation.submit).toHaveBeenCalledTimes(
            1
          );
        });
        expect(GleanMetrics.loginConfirmation.success).toHaveBeenCalledTimes(1);
        expect(GleanMetrics.isDone).toHaveBeenCalledTimes(1);
      }
      it('default behavior', async () => {
        const mockOnSessionVerified = jest.fn().mockResolvedValue(true);
        session = mockSession();
        render({
          onSessionVerified: mockOnSessionVerified,
        });
        await submitCode();

        await expectSuccessGleanEvents();
        expect(mockOnSessionVerified).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith('/settings', { replace: false });
      });
      it('when verificationReason is a force password change', async () => {
        session = mockSession();
        const verificationReason = VerificationReasons.CHANGE_PASSWORD;
        render({ verificationReason });
        await submitCode();

        await expectSuccessGleanEvents();
        expect(hardNavigateSpy).toHaveBeenCalledWith(
          '/post_verify/password/force_password_change',
          {},
          true
        );
      });
      // it('with sync integration', () => {
      //   // TODO in FXA-9059 sync v3 desktop integration
      // });
      it('with OAuth integration', async () => {
        session = mockSession();
        const finishOAuthFlowHandler = jest
          .fn()
          .mockReturnValueOnce(MOCK_OAUTH_FLOW_HANDLER_RESPONSE);
        const integration = createMockSigninOAuthIntegration();
        const hardNavigate = jest
          .spyOn(ReactUtils, 'hardNavigate')
          .mockImplementation(() => {});

        render({ finishOAuthFlowHandler, integration });
        await submitCode();
        await expectSuccessGleanEvents();
        await waitFor(() => {
          expect(hardNavigate).toHaveBeenCalledWith(
            'someUri',
            undefined,
            undefined,
            true
          );
        });
      });

      it('does not navigate if integration isFirefoxMobileClient', async () => {
        const handleNavigationSpy = jest.spyOn(SigninUtils, 'handleNavigation');
        session = mockSession();
        const finishOAuthFlowHandler = jest
          .fn()
          .mockReturnValueOnce(MOCK_OAUTH_FLOW_HANDLER_RESPONSE);
        const integration = createMockSigninOAuthNativeSyncIntegration({
          isMobile: true,
        });
        render({
          finishOAuthFlowHandler,
          integration,
        });
        await submitCode();
        await waitFor(() => {
          expect(handleNavigationSpy).toHaveBeenCalledWith(
            expect.objectContaining({
              performNavigation: false,
            })
          );
        });
      });
    });
  });
});
