/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MOCK_ACCOUNT, renderWithRouter } from '../../../models/mocks';
import SigninBounced, { viewName } from '.';
import { usePageViewEvent, logViewEvent } from '../../../lib/metrics';
import { REACT_ENTRYPOINT } from '../../../constants';
import GleanMetrics from '../../../lib/glean';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
}));

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {
    isDone: jest.fn(),
    login: {
      signinBouncedView: jest.fn(),
      signinBouncedBackClick: jest.fn(),
      signinBouncedCreateAccountClick: jest.fn(),
      signinBouncedSupportClick: jest.fn(),
    },
  },
}));

const mockLocationHook = jest.fn();
const mockNavigateHook = jest.fn();
jest.mock('react-router', () => {
  return {
    ...jest.requireActual('react-router'),
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
    expect(GleanMetrics.login.signinBouncedView).toHaveBeenCalledTimes(1);
  });

  it('emits the expected metrics on the "Create Account" action', () => {
    renderWithRouter(<SigninBounced email={MOCK_ACCOUNT.primaryEmail.email} />);
    fireEvent.click(screen.getByTestId('signin-bounced-create-account-btn'));
    expect(logViewEvent).toHaveBeenCalledWith(
      viewName,
      'link.create-account',
      REACT_ENTRYPOINT
    );
    expect(
      GleanMetrics.login.signinBouncedCreateAccountClick
    ).toHaveBeenCalledTimes(1);
  });

  it('emits the back click event and calls onBackButtonClick', async () => {
    const user = userEvent.setup();
    const onBackButtonClick = jest.fn();
    renderWithRouter(
      <SigninBounced
        email={MOCK_ACCOUNT.primaryEmail.email}
        canGoBack
        {...{ onBackButtonClick }}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(logViewEvent).toHaveBeenCalledWith(
      viewName,
      'link.back',
      REACT_ENTRYPOINT
    );
    expect(GleanMetrics.login.signinBouncedBackClick).toHaveBeenCalledTimes(1);
    expect(onBackButtonClick).toHaveBeenCalledTimes(1);
  });

  it('emits the back click event without onBackButtonClick', async () => {
    const user = userEvent.setup();
    const backSpy = jest.spyOn(window.history, 'back').mockImplementation();
    renderWithRouter(
      <SigninBounced email={MOCK_ACCOUNT.primaryEmail.email} canGoBack />
    );
    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(GleanMetrics.login.signinBouncedBackClick).toHaveBeenCalledTimes(1);
    expect(backSpy).toHaveBeenCalledTimes(1);
    backSpy.mockRestore();
  });

  describe('support link', () => {
    const originalLocation = window.location;

    beforeEach(() => {
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: { ...originalLocation, replace: jest.fn() },
      });
    });

    afterEach(() => {
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: originalLocation,
      });
    });

    it('emits the support click event and navigates after the Glean flush', async () => {
      const user = userEvent.setup();
      let resolveFlush = () => {};
      (GleanMetrics.isDone as jest.Mock).mockReturnValueOnce(
        new Promise<void>((resolve) => (resolveFlush = resolve))
      );
      renderWithRouter(
        <SigninBounced email={MOCK_ACCOUNT.primaryEmail.email} />
      );
      await user.click(screen.getByRole('button', { name: /let us know/ }));
      expect(logViewEvent).toHaveBeenCalledWith(
        viewName,
        'link.support',
        REACT_ENTRYPOINT
      );
      expect(
        GleanMetrics.login.signinBouncedSupportClick
      ).toHaveBeenCalledTimes(1);
      expect(window.location.replace).not.toHaveBeenCalled();
      resolveFlush();
      await waitFor(() =>
        expect(window.location.replace).toHaveBeenCalledWith(
          'https://support.mozilla.org/'
        )
      );
    });
  });

  it('pushes the user to the / page if there is no email address available', () => {
    renderWithRouter(<SigninBounced />);
    expect(mockNavigateHook).toHaveBeenCalledWith('/');
    expect(GleanMetrics.login.signinBouncedView).toHaveBeenCalledTimes(1);
  });
});
