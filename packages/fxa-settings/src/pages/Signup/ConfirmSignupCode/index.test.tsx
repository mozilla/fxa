/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider'; // import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';
import { logViewEvent, usePageViewEvent } from '../../../lib/metrics';
import ConfirmSignupCode, { viewName } from '.';
import { REACT_ENTRYPOINT } from '../../../constants';
import { Account, AppContext } from '../../../models';
import { MOCK_ACCOUNT, mockAppContext } from '../../../models/mocks';
import { LocationProvider } from '@reach/router';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
}));

// TODO test for email received from params (if arriving from content-server) in FXA-8303
const mockLocation = (mockNewsletterSlugs?: string[]) => {
  return {
    pathname: `/signup`,
    state: {
      email: MOCK_ACCOUNT.primaryEmail.email,
    },
  };
};

const mockNavigate = jest.fn();
jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation(),
}));

let account: Account;

function renderWithAccount(account: Account) {
  renderWithLocalizationProvider(
    <AppContext.Provider value={mockAppContext({ account })}>
      <LocationProvider>
        <ConfirmSignupCode />
      </LocationProvider>
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

  beforeEach(() => {
    account = {
      verifySession: jest.fn().mockResolvedValue(true),
    } as unknown as Account;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders as expected', () => {
    renderWithAccount(account);
    // testAllL10n(screen, bundle);

    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent(
      'Enter confirmation code for your Firefox account'
    );
    screen.getByLabelText('Enter 6-digit code');

    screen.getByRole('button', { name: 'Confirm' });
    screen.getByRole('button', { name: 'Email new code.' });
  });

  it('emits a metrics event on render', async () => {
    renderWithAccount(account);
    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);

    //  Input field is autofocused on render and should emit an 'engage' event metric
    await waitFor(() => {
      expect(logViewEvent).toHaveBeenCalledWith(
        `flow.${viewName}`,
        'engage',
        REACT_ENTRYPOINT
      );
    });
  });

  it('emits a metrics event on successful form submission', async () => {
    renderWithAccount(account);

    const codeInput = screen.getByLabelText('Enter 6-digit code');
    fireEvent.input(codeInput, {
      target: { value: '123123' },
    });

    const submitButton = screen.getByRole('button', { name: 'Confirm' });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(logViewEvent).toHaveBeenCalledWith(
        `flow.${viewName}`,
        'verification.success',
        REACT_ENTRYPOINT
      );
    });
  });

  it('submits successfully', async () => {
    renderWithAccount(account);

    const codeInput = screen.getByLabelText('Enter 6-digit code');
    fireEvent.input(codeInput, {
      target: { value: '123456' },
    });

    const submitButton = screen.getByRole('button', { name: 'Confirm' });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(account.verifySession).toHaveBeenCalled();
      // TODO add test for alertBar in FXA-8303
      expect(mockNavigate).toHaveBeenCalledWith('/settings', { replace: true });
    });
  });

  // TODO: newsletters submission checks in FXA-8303
  // it('on success with newsletters selected', () => {
  // receive newsletter slugs in location state from signup
  // check that those slugs are sent up
  // })
});

describe('ConfirmSignupCode page with error states', () => {
  beforeEach(() => {
    account = {
      verifySession: jest.fn().mockResolvedValue(new Error()),
    } as unknown as Account;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders an error tooltip when the form is submitted without a code', async () => {
    renderWithAccount(account);

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
    });
  });

  // TODO add test for expected behaviour on verifySession fail in FXA-8303
});

describe('Resending a new code from ConfirmSignupCode page', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('displays a success banner when successful', async () => {
    account = {
      sendVerificationCode: jest.fn().mockResolvedValue(true),
    } as unknown as Account;

    renderWithAccount(account);

    const resendEmailButton = screen.getByRole('button', {
      name: 'Email new code.',
    });
    fireEvent.click(resendEmailButton);
    await waitFor(() => {
      expect(
        screen.getByText(
          'Email resent. Add accounts@firefox.com to your contacts to ensure a smooth delivery.'
        )
      ).toBeInTheDocument();
    });
  });

  it('displays an error banner when unsuccessful', async () => {
    account = {
      sendVerificationCode: jest.fn().mockRejectedValue(new Error()),
    } as unknown as Account;

    renderWithAccount(account);

    const resendEmailButton = screen.getByRole('button', {
      name: 'Email new code.',
    });
    fireEvent.click(resendEmailButton);
    await waitFor(() => {
      expect(
        screen.getByText('Something went wrong. A new code could not be sent.')
      ).toBeInTheDocument();
    });
  });
});
