/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { LocationProvider } from '@reach/router';
// import { FluentBundle } from '@fluent/bundle';
// import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
import { FIREFOX_NOREPLY_EMAIL, REACT_ENTRYPOINT } from '../../../constants';
import { usePageViewEvent } from '../../../lib/metrics';
import { Account, AppContext, Session } from '../../../models';
import {
  mockAppContext,
  mockEmail,
  MOCK_ACCOUNT,
  MOCK_PROFILE_INFO,
  mockSession,
} from '../../../models/mocks';
import Confirm, { viewName } from '.';
import { MOCK_SESSION_TOKEN, MOCK_UNVERIFIED_SESSION } from './mocks';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
}));
jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  navigate: jest.fn(),
}));

const MOCK_ACCOUNT_WITH_SUCCESS = {
  getProfileInfo: jest.fn().mockResolvedValue(MOCK_PROFILE_INFO),
  sendVerificationCode: jest.fn().mockResolvedValue(true),
  primaryEmail: mockEmail(MOCK_ACCOUNT.primaryEmail.email, true, false),
} as unknown as Account;

const MOCK_ACCOUNT_WITH_ERROR = {
  getProfileInfo: jest.fn().mockResolvedValue(MOCK_PROFILE_INFO),
  sendVerificationCode: jest.fn().mockRejectedValue(Error),
  primaryEmail: mockEmail(MOCK_ACCOUNT.primaryEmail.email, true, false),
} as unknown as Account;

function renderWithContext(
  account: Account | undefined,
  session: Session,
  sessionTokenId: string | null
) {
  renderWithLocalizationProvider(
    <AppContext.Provider
      value={mockAppContext({
        account,
        session,
      })}
    >
      <LocationProvider>
        <Confirm {...{ sessionTokenId }} />
      </LocationProvider>
    </AppContext.Provider>
  );
}

describe('Confirm page', () => {
  // TODO : l10n test currently failing on image l10n
  // - enabling these tests will require attributes handling
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });
  afterEach(() => jest.clearAllMocks());

  it('renders a loading spinner until account data is available', async () => {
    renderWithContext(
      MOCK_ACCOUNT_WITH_SUCCESS,
      MOCK_UNVERIFIED_SESSION,
      MOCK_SESSION_TOKEN
    );
    expect(screen.getByRole('img', { name: 'Loading…' })).toBeInTheDocument();
    await waitFor(() => {
      const headingEl = screen.getByRole('heading', { level: 1 });
      expect(headingEl).toHaveTextContent('Confirm your account');
    });
  });

  it('renders as expected with unverified session, session token and profile info', async () => {
    renderWithContext(
      MOCK_ACCOUNT_WITH_SUCCESS,
      MOCK_UNVERIFIED_SESSION,
      MOCK_SESSION_TOKEN
    );
    // wait for setEmail to update with email from account model
    await waitFor(() => {
      const headingEl = screen.getByRole('heading', { level: 1 });
      expect(headingEl).toHaveTextContent('Confirm your account');
      screen.getByText(
        `Check your email for the confirmation link sent to ${MOCK_ACCOUNT.primaryEmail.email}`
      );
      screen.getByRole('button', {
        name: 'Not in inbox or spam folder? Resend',
      });
      // testAllL10n(screen, bundle, { email: MOCK_ACCOUNT.primaryEmail.email });
    });
  });

  it('resends the email when the user clicks the resend button', async () => {
    const account: Account = MOCK_ACCOUNT_WITH_SUCCESS;
    const session = mockSession(false, false);
    renderWithContext(account, session, MOCK_SESSION_TOKEN);
    await waitFor(() => {
      const resendEmailButton = screen.getByRole('button', {
        name: 'Not in inbox or spam folder? Resend',
      });
      fireEvent.click(resendEmailButton);
      expect(session.sendVerificationCode).toBeCalled();
      const successBannerText = `Email resent. Add ${FIREFOX_NOREPLY_EMAIL} to your contacts to ensure a smooth delivery.`;
      expect(screen.getByText(successBannerText)).toBeInTheDocument();
    });
  });

  it('renders an error banner when resending an email fails', async () => {
    const account: Account = MOCK_ACCOUNT_WITH_ERROR;
    const session = mockSession(false, true);
    renderWithContext(account, session, MOCK_SESSION_TOKEN);
    await waitFor(() => {
      const resendEmailButton = screen.getByRole('button', {
        name: 'Not in inbox or spam folder? Resend',
      });
      fireEvent.click(resendEmailButton);
      expect(session.sendVerificationCode).toBeCalled();
      const bannerText = `Unexpected error`;
      expect(screen.getByText(bannerText)).toBeInTheDocument();
    });
  });

  // only page view event added, could not hit route on prod to test which other metrics should be emitted
  it('emits a metrics event on render', async () => {
    renderWithContext(
      MOCK_ACCOUNT_WITH_SUCCESS,
      MOCK_UNVERIFIED_SESSION,
      MOCK_SESSION_TOKEN
    );
    await waitFor(() => {
      expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
    });
  });
});
