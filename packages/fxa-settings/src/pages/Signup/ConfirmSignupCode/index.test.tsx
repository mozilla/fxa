/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider'; // import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';
import { logViewEvent, usePageViewEvent } from '../../../lib/metrics';
import { viewName } from '.';
import { REACT_ENTRYPOINT } from '../../../constants';
import { Session, AppContext } from '../../../models';
import { mockAppContext, mockSession } from '../../../models/mocks';
import {
  MOCK_AUTH_ERROR,
  MOCK_SIGNUP_CODE,
  Subject,
  createMockOAuthNativeIntegration,
  createMockOAuthWebIntegration,
  createMockWebIntegration,
} from './mocks';
import {
  MOCK_OAUTH_FLOW_HANDLER_RESPONSE,
  MOCK_STORED_ACCOUNT,
  mockFinishOAuthFlowHandler,
} from '../../mocks';
import GleanMetrics from '../../../lib/glean';
import { useWebRedirect } from '../../../lib/hooks/useWebRedirect';
import { ConfirmSignupCodeIntegration } from './interfaces';
import * as ReactUtils from 'fxa-react/lib/utils';
import {
  FinishOAuthFlowHandler,
  tryAgainError,
} from '../../../lib/oauth/hooks';
import { OAUTH_ERRORS } from '../../../lib/oauth';
import firefox from '../../../lib/channels/firefox';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
  queryParamsToMetricsContext: jest.fn(),
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

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {
    registration: {
      complete: jest.fn(),
    },
    signupConfirmation: {
      view: jest.fn(),
      submit: jest.fn(),
    },
    isDone: jest.fn(),
  },
}));

jest.mock('../../../lib/hooks/useWebRedirect');

jest.mock('../../../lib/cache', () => ({
  ...jest.requireActual('../../../lib/cache'),
  currentAccount: () => MOCK_STORED_ACCOUNT,
}));

jest.mock('../../../lib/storage-utils', () => ({
  ...jest.requireActual('../../../lib/storage-utils'),
  persistAccount: jest.fn(),
}));

jest.spyOn(ReactUtils, 'hardNavigate').mockImplementation(() => {});

let session: Session;

function renderWithSession({
  session,
  newsletterSlugs,
  integration,
  finishOAuthFlowHandler,
  offeredSyncEngines,
  declinedSyncEngines,
}: {
  session?: Session;
  newsletterSlugs?: string[];
  integration?: ConfirmSignupCodeIntegration;
  finishOAuthFlowHandler?: FinishOAuthFlowHandler;
  offeredSyncEngines?: string[];
  declinedSyncEngines?: string[];
}) {
  renderWithLocalizationProvider(
    <AppContext.Provider value={mockAppContext({ session })}>
      <Subject
        {...{
          newsletterSlugs,
          integration,
          finishOAuthFlowHandler,
          offeredSyncEngines,
          declinedSyncEngines,
        }}
      />
    </AppContext.Provider>
  );
}

describe('ConfirmSignupCode page', () => {
  // TODO: enable l10n tests when they've been updated to handle embedded tags in ftl strings
  // TODO: in FXA-6461
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });
  const submit = (code = MOCK_SIGNUP_CODE) => {
    const codeInput = screen.getByLabelText('Enter 6-digit code');
    fireEvent.input(codeInput, {
      target: { value: code },
    });

    const submitButton = screen.getByRole('button', { name: 'Confirm' });
    fireEvent.click(submitButton);
  };

  beforeEach(() => {
    session = {
      verifySession: jest.fn().mockResolvedValue(true),
    } as unknown as Session;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders as expected', () => {
    renderWithSession({ session });
    // testAllL10n(screen, bundle);

    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent(
      'Enter confirmation code for your Mozilla account'
    );
    screen.getByLabelText('Enter 6-digit code');

    screen.getByRole('button', { name: 'Confirm' });
    screen.getByRole('button', { name: 'Email new code.' });
  });

  it('emits a metrics event on render', async () => {
    renderWithSession({ session });
    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
    expect(GleanMetrics.signupConfirmation.view).toHaveBeenCalledTimes(1);

    // Input field is autofocused on render and should emit an 'engage' event metric
    await waitFor(() => {
      expect(logViewEvent).toHaveBeenCalledWith(
        `flow.${viewName}`,
        'engage',
        REACT_ENTRYPOINT
      );
    });
  });

  it('emits a metrics event on successful form submission', async () => {
    renderWithSession({ session });
    submit();

    await waitFor(() => {
      expect(logViewEvent).toHaveBeenCalledWith(
        `flow.${viewName}`,
        'verification.success',
        REACT_ENTRYPOINT
      );
      expect(GleanMetrics.signupConfirmation.submit).toHaveBeenCalledTimes(1);
    });
  });

  it('submits successfully without newsletters', async () => {
    renderWithSession({ session });
    submit();

    await waitFor(() => {
      expect(session.verifySession).toHaveBeenCalled();
      expect(logViewEvent).toHaveBeenCalledTimes(3);
      expect(logViewEvent).not.toHaveBeenCalledWith(
        'flow',
        'newsletter.subscribed',
        {
          entrypoint_variation: 'react',
        }
      );
      expect(GleanMetrics.signupConfirmation.submit).toHaveBeenCalledTimes(1);
    });
  });

  it('submits successfully with newsletters', async () => {
    // newsletter slugs are selected on the previous page
    // and received via location state as an array of strings
    const mockNewsletterArray = ['mock-slug-1'];
    renderWithSession({ session, newsletterSlugs: mockNewsletterArray });
    submit();

    await waitFor(() => {
      expect(session.verifySession).toHaveBeenCalledWith(MOCK_SIGNUP_CODE, {
        newsletters: mockNewsletterArray,
      });
      expect(logViewEvent).toHaveBeenCalledTimes(4);
      expect(logViewEvent).toHaveBeenCalledWith(
        'flow',
        'newsletter.subscribed',
        {
          entrypoint_variation: 'react',
        }
      );
      expect(GleanMetrics.signupConfirmation.submit).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/settings', { replace: true });
    });
  });

  describe('OAuth web integration', () => {
    let fxaOAuthLoginSpy: jest.SpyInstance;
    beforeEach(() => {
      fxaOAuthLoginSpy = jest.spyOn(firefox, 'fxaOAuthLogin');
    });
    const integration = createMockOAuthWebIntegration();

    it('shows an error banner for an OAuth error', async () => {
      renderWithSession({
        session,
        integration,
        finishOAuthFlowHandler: jest.fn().mockReturnValueOnce(tryAgainError()),
      });
      submit();

      await waitFor(() => {
        screen.getByText(OAUTH_ERRORS.TRY_AGAIN.message);
      });
    });

    it('does not send web channel messages', async () => {
      renderWithSession({
        session,
        integration,
        finishOAuthFlowHandler: jest.fn(),
      });
      submit();

      await waitFor(() => {
        expect(fxaOAuthLoginSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('OAuth native integration', () => {
    let fxaOAuthLoginSpy: jest.SpyInstance;
    beforeEach(() => {
      fxaOAuthLoginSpy = jest.spyOn(firefox, 'fxaOAuthLogin');
    });

    it('sends expected web channel messages when service=sync', async () => {
      const integration = createMockOAuthNativeIntegration();
      const offeredSyncEngines = ['blabbitybee', 'bloopitybop'];
      const declinedSyncEngines = ['bloopitybop'];
      renderWithSession({
        session,
        integration,
        finishOAuthFlowHandler: mockFinishOAuthFlowHandler,
        declinedSyncEngines,
        offeredSyncEngines,
      });
      submit();

      await waitFor(() => {
        expect(fxaOAuthLoginSpy).toHaveBeenCalledWith({
          declinedSyncEngines,
          offeredSyncEngines,
          action: 'signup',
          ...MOCK_OAUTH_FLOW_HANDLER_RESPONSE,
        });
      });
    });
    it('sends expected web channel messages when service=relay', async () => {
      const integration = createMockOAuthNativeIntegration(false);
      renderWithSession({
        session,
        integration,
        finishOAuthFlowHandler: mockFinishOAuthFlowHandler,
      });
      submit();

      await waitFor(() => {
        expect(fxaOAuthLoginSpy).toHaveBeenCalledWith({
          action: 'signup',
          ...MOCK_OAUTH_FLOW_HANDLER_RESPONSE,
        });
      });
    });
  });

  describe('Web integration on submission', () => {
    it('with valid redirectTo', async () => {
      const redirectTo = 'surprisinglyValid!';
      const integration = createMockWebIntegration({ redirectTo });
      (useWebRedirect as jest.Mock).mockReturnValue({
        isValid: true,
      });
      renderWithSession({ session, integration });
      submit();

      await waitFor(() => {
        expect(GleanMetrics.registration.complete).toHaveBeenCalledTimes(1);
        expect(ReactUtils.hardNavigate).toHaveBeenCalledWith(redirectTo);
      });
    });

    it('with invalid redirectTo', async () => {
      const integration = createMockWebIntegration({
        redirectTo: 'sadlyInvalid',
      });
      (useWebRedirect as jest.Mock).mockReturnValue({
        isValid: false,
        localizedInvalidRedirectError: AuthUiErrors.INVALID_REDIRECT_TO.message,
      });
      renderWithSession({ session, integration });
      submit();

      await screen.findByText(AuthUiErrors.INVALID_REDIRECT_TO.message);
    });

    it('without redirectTo', async () => {
      renderWithSession({ session });
      submit();

      await waitFor(() => {
        expect(GleanMetrics.registration.complete).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith('/settings', {
          replace: true,
        });
      });
    });
  });
});

describe('ConfirmSignupCode page with error states', () => {
  beforeEach(() => {
    session = {
      verifySession: jest.fn().mockResolvedValue(new Error()),
    } as unknown as Session;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders an error tooltip when the form is submitted without a code', async () => {
    renderWithSession({ session });

    const codeInput = screen.getByLabelText('Enter 6-digit code');
    fireEvent.change(codeInput, {
      target: { value: '' },
    });

    const submitButton = screen.getByRole('button', { name: 'Confirm' });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByTestId('tooltip')).toHaveTextContent(
        'Confirmation code is required'
      );
      expect(GleanMetrics.signupConfirmation.submit).not.toHaveBeenCalled();
    });
  });

  // TODO add test for expected behaviour on verifySession fail in FXA-8303
});

describe('Resending a new code from ConfirmSignupCode page', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('displays a success banner when successful', async () => {
    session = mockSession(true, false);

    renderWithSession({ session });

    const resendEmailButton = screen.getByRole('button', {
      name: 'Email new code.',
    });
    fireEvent.click(resendEmailButton);
    await waitFor(() => {
      expect(
        screen.getByText(/A new code was sent to your email./)
      ).toBeInTheDocument();
    });
  });

  it('displays an error banner when unsuccessful', async () => {
    session = {
      sendVerificationCode: jest.fn().mockRejectedValue(MOCK_AUTH_ERROR),
    } as unknown as Session;

    renderWithSession({ session });

    const resendEmailButton = screen.getByRole('button', {
      name: 'Email new code.',
    });
    fireEvent.click(resendEmailButton);
    await waitFor(() => {
      expect(screen.getByText('Unexpected error')).toBeInTheDocument();
    });
  });
});
