/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import LinkRememberPassword, { LinkRememberPasswordProps } from '.';
import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
import { FluentBundle } from '@fluent/bundle';
import { MOCK_CLIENT_ID, MOCK_EMAIL } from '../../pages/mocks';
import { MemoryRouter } from 'react-router';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../models/mocks';
import GleanMetrics from '../../lib/glean';

jest.mock('../../lib/glean', () => ({
  __esModule: true,
  default: {
    passwordReset: {
      emailConfirmationSignin: jest.fn(),
      rememberPasswordLinkView: jest.fn(),
      rememberPasswordLinkClick: jest.fn(),
    },
  },
}));

const INITIAL_ROUTE = {
  pathname: '/some-start-route',
  search: `?client_id=${MOCK_CLIENT_ID}`,
};

const Subject = ({
  email = MOCK_EMAIL,
  clickHandler,
  showPasskeyOption,
  entrypoint = 'reset_password',
}: Partial<LinkRememberPasswordProps>) => (
  <MemoryRouter initialEntries={[INITIAL_ROUTE]}>
    <LinkRememberPassword
      {...{ email, clickHandler, showPasskeyOption, entrypoint }}
    />
  </MemoryRouter>
);

describe('LinkRememberPassword', () => {
  let bundle: FluentBundle;
  beforeAll(async () => {
    bundle = await getFtlBundle('settings');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders as expected', () => {
    renderWithLocalizationProvider(<Subject />);
    testAllL10n(screen, bundle);

    expect(screen.getByText('Remember your password?')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeVisible();
  });

  it('renders the passkey wording when showPasskeyOption is true', () => {
    renderWithLocalizationProvider(<Subject showPasskeyOption />);

    expect(
      screen.getByText('Have a passkey or remember your password?')
    ).toBeVisible();
    expect(
      screen.queryByText('Remember your password?')
    ).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeVisible();
  });

  it('renders the standard wording when showPasskeyOption is false', () => {
    renderWithLocalizationProvider(<Subject showPasskeyOption={false} />);

    expect(screen.getByText('Remember your password?')).toBeVisible();
    expect(
      screen.queryByText('Have a passkey or remember your password?')
    ).not.toBeInTheDocument();
  });

  it('links to index and appends parameters', async () => {
    renderWithLocalizationProvider(<Subject />);

    const rememberPasswordLink = screen.getByRole('link', {
      name: 'Sign in',
    });

    expect(rememberPasswordLink).toHaveAttribute('href', `/?client_id=123`);
  });

  it('executes a clickHandler if passed in as prop', async () => {
    const mockClickHandler = jest.fn();
    const user = userEvent.setup();

    renderWithLocalizationProvider(<Subject clickHandler={mockClickHandler} />);

    await user.click(screen.getByRole('link', { name: /^Sign in/ }));

    expect(mockClickHandler).toHaveBeenCalledTimes(1);
  });

  it('records a rememberPasswordLinkView impression on mount with the passkey flag', () => {
    renderWithLocalizationProvider(
      <Subject showPasskeyOption entrypoint="confirm_reset_password" />
    );

    expect(
      GleanMetrics.passwordReset.rememberPasswordLinkView
    ).toHaveBeenCalledWith({
      event: { has_passkey_option: 'true', reason: 'confirm_reset_password' },
    });
  });

  it('records rememberPasswordLinkClick and calls clickHandler on Sign in click', async () => {
    const mockClickHandler = jest.fn();
    const user = userEvent.setup();

    renderWithLocalizationProvider(<Subject clickHandler={mockClickHandler} />);

    await user.click(screen.getByRole('link', { name: 'Sign in' }));

    expect(
      GleanMetrics.passwordReset.rememberPasswordLinkClick
    ).toHaveBeenCalledWith({
      event: { has_passkey_option: 'false', reason: 'reset_password' },
    });
    expect(mockClickHandler).toHaveBeenCalledTimes(1);
  });

  describe('location state', () => {
    it('updates location with expected state when the link is clicked', async () => {
      // Render the component within a router for testing navigation.
      const { router } = renderWithRouter(
        <LinkRememberPassword email={MOCK_EMAIL} entrypoint="reset_password" />,
        { route: INITIAL_ROUTE }
      );

      // Find and assert the link is visible.
      const rememberPasswordLink = screen.getByRole('link', {
        name: 'Sign in',
      });
      expect(rememberPasswordLink).toBeVisible();
      expect(rememberPasswordLink).toHaveAttribute(
        'href',
        `/?client_id=${MOCK_CLIENT_ID}`
      );

      const user = userEvent.setup();
      await user.click(rememberPasswordLink);

      // Check that the pathname is updated if the link has a destination change.
      expect(router.state.location.pathname).toStrictEqual('/');

      expect(router.state.location.state).toMatchObject({
        prefillEmail: MOCK_EMAIL,
      });
    });
  });
});
