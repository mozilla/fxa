/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { MOCK_ACCOUNT, renderWithRouter } from '../../../models/mocks';
import SigninBounced, { viewName } from '.';
import { usePageViewEvent, logViewEvent } from '../../../lib/metrics';
import { REACT_ENTRYPOINT } from '../../../constants';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
}));

const mockLocationHook = jest.fn();
const mockNavigateHook = jest.fn();
jest.mock('@reach/router', () => {
  return {
    ...jest.requireActual('@reach/router'),
    useNavigate: () => mockNavigateHook,
    useLocation: () => mockLocationHook,
  };
});

describe('SigninBounced', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders default content as expected', () => {
    renderWithRouter(<SigninBounced email={MOCK_ACCOUNT.primaryEmail.email} />);
    screen.getByRole('heading', {
      name: 'Sorry. We’ve locked your account.',
    });
    const supportLink = screen.getByRole('button', {
      name: /let us know/,
    });
    expect(supportLink).toBeInTheDocument();
  });

  it('renders the "Back" button when a user can go back', () => {
    renderWithRouter(
      <SigninBounced email={MOCK_ACCOUNT.primaryEmail.email} canGoBack />
    );
    const backButton = screen.getByRole('button', { name: 'Back' });
    expect(backButton).toBeInTheDocument();
  });

  it('emits the expected metrics on render', async () => {
    renderWithRouter(<SigninBounced email={MOCK_ACCOUNT.primaryEmail.email} />);
    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
  });

  it('emits the expected metrics on the "Create Account" action', () => {
    renderWithRouter(<SigninBounced email={MOCK_ACCOUNT.primaryEmail.email} />);
    fireEvent.click(screen.getByTestId('signin-bounced-create-account-btn'));
    expect(logViewEvent).toHaveBeenCalledWith(
      viewName,
      'link.create-account',
      REACT_ENTRYPOINT
    );
  });

  it('pushes the user to the / page if there is no email address available', () => {
    renderWithRouter(<SigninBounced />);
    expect(mockNavigateHook).toHaveBeenCalledWith('/');
  });
});
