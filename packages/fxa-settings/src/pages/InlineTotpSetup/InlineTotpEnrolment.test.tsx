/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen, waitFor } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import InlineTotpEnrolment from './InlineTotpEnrolment';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import {
  MOCK_QUERY_PARAMS,
  MOCK_SIGNIN_LOCATION_STATE,
  MOCK_SIGNIN_RECOVERY_LOCATION_STATE,
  MOCK_TOTP_TOKEN,
} from './mocks';
import { SigninLocationState } from '../Signin/interfaces';
import { JwtTokenCache } from '../../lib/cache';
import { MfaContext, MfaSessionTokenContext } from '../../lib/hooks';
import { queryParamsToMetricsContext } from '../../lib/metrics';
import GleanMetrics from '../../lib/glean';

const mockCreateTotpTokenWithJwt = jest.fn();
const mockVerifyTotpSetupCodeWithJwt = jest.fn();

jest.mock('../../models', () => ({
  ...jest.requireActual('../../models'),
  useAuthClient: () => ({
    createTotpTokenWithJwt: mockCreateTotpTokenWithJwt,
    verifyTotpSetupCodeWithJwt: mockVerifyTotpSetupCodeWithJwt,
  }),
}));

const JWT = 'test-jwt';
const SESSION_TOKEN = MOCK_SIGNIN_LOCATION_STATE.sessionToken;
const metricsContext = queryParamsToMetricsContext(
  MOCK_QUERY_PARAMS as unknown as Record<string, string>
);

const navTo = jest.fn();
const onBackButtonClick = jest.fn();

// Render under the MFA contexts MfaGuardCore normally provides, so
// useMfaErrorHandler resolves the scope and session token.
const renderEnrolment = () =>
  renderWithLocalizationProvider(
    <MfaContext.Provider value="2fa">
      <MfaSessionTokenContext.Provider value={SESSION_TOKEN}>
        <InlineTotpEnrolment
          sessionToken={SESSION_TOKEN}
          signinState={
            MOCK_SIGNIN_LOCATION_STATE as unknown as SigninLocationState
          }
          metricsContext={metricsContext}
          navTo={navTo}
          currentStep={1}
          onBackButtonClick={onBackButtonClick}
        />
      </MfaSessionTokenContext.Provider>
    </MfaContext.Provider>
  );

describe('InlineTotpEnrolment', () => {
  let user: UserEvent;

  const submitCode = async (code: string) => {
    await user.type(await screen.findByLabelText('Enter 6-digit code'), code);
    await user.click(screen.getByRole('button', { name: 'Continue' }));
  };

  beforeEach(() => {
    user = userEvent.setup();
    navTo.mockReset();
    onBackButtonClick.mockReset();
    mockCreateTotpTokenWithJwt.mockReset();
    mockVerifyTotpSetupCodeWithJwt.mockReset();
    // Spy (not mock) so FlowSetup2faApp's other Glean calls still run for real.
    jest
      .spyOn(GleanMetrics.accountPref, 'twoStepAuthQrCodeSuccess')
      .mockImplementation(() => {});
    mockCreateTotpTokenWithJwt.mockResolvedValue(MOCK_TOTP_TOKEN);
    // Seed the JWT the guard would have obtained via email OTP.
    JwtTokenCache.setToken(SESSION_TOKEN, '2fa', JWT);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows the card loading spinner while the TOTP token is being created', () => {
    mockCreateTotpTokenWithJwt.mockImplementation(() => new Promise(() => {}));
    renderEnrolment();
    expect(screen.getByLabelText('Loading…')).toBeInTheDocument();
  });

  it('creates the TOTP token with the cached JWT and shows the QR code', async () => {
    renderEnrolment();

    expect(
      await screen.findByRole('progressbar', { name: 'Step 1 of 4.' })
    ).toBeInTheDocument();
    expect(await screen.findByText(/Scan this QR code/)).toBeInTheDocument();
    expect(mockCreateTotpTokenWithJwt).toHaveBeenCalledWith(JWT, {
      metricsContext,
    });
  });

  it('calls onBackButtonClick when the back button is clicked', async () => {
    renderEnrolment();
    await user.click(await screen.findByRole('button', { name: 'Back' }));
    expect(onBackButtonClick).toHaveBeenCalled();
  });

  it('verifies the code and redirects to inline_recovery_setup on success', async () => {
    mockVerifyTotpSetupCodeWithJwt.mockResolvedValue({ success: true });
    renderEnrolment();
    await submitCode('123456');

    await waitFor(() =>
      expect(navTo).toHaveBeenCalledWith(
        '/inline_recovery_setup',
        MOCK_SIGNIN_RECOVERY_LOCATION_STATE
      )
    );
    expect(mockVerifyTotpSetupCodeWithJwt).toHaveBeenCalledWith(JWT, '123456', {
      metricsContext,
    });
    expect(GleanMetrics.accountPref.twoStepAuthQrCodeSuccess).toHaveBeenCalled();
  });

  it('shows an error and does not redirect on an incorrect code', async () => {
    mockVerifyTotpSetupCodeWithJwt.mockRejectedValue(new Error('bad code'));
    renderEnrolment();
    await submitCode('000000');

    expect(
      await screen.findByText(/Invalid or expired code/)
    ).toBeInTheDocument();
    expect(navTo).not.toHaveBeenCalled();
  });

  it('clears the cached JWT and shows no code error when the MFA token is invalid', async () => {
    const invalidJwtError = Object.assign(new Error('invalid mfa token'), {
      errno: AuthUiErrors.INVALID_MFA_TOKEN.errno,
    });
    mockVerifyTotpSetupCodeWithJwt.mockRejectedValue(invalidJwtError);
    renderEnrolment();
    await submitCode('101010');

    // The guard re-prompts (JWT dropped); the stale JWT is not surfaced as a
    // bad-code error.
    await waitFor(() =>
      expect(JwtTokenCache.hasToken(SESSION_TOKEN, '2fa')).toBe(false)
    );
    expect(
      screen.queryByText(/Invalid or expired code/)
    ).not.toBeInTheDocument();
    expect(navTo).not.toHaveBeenCalled();
  });
});
