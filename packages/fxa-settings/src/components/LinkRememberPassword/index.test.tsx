/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen, waitFor } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import LinkRememberPassword, { LinkRememberPasswordProps } from '.';
import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
import { FluentBundle } from '@fluent/bundle';
import { MOCK_CLIENT_ID, MOCK_EMAIL } from '../../pages/mocks';
import { MemoryRouter } from 'react-router';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../models/mocks';

jest.mock('../../lib/glean', () => ({
  __esModule: true,
  default: {
    passwordReset: {
      emailConfirmationSignin: jest.fn(),
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
}: Partial<LinkRememberPasswordProps>) => (
  <MemoryRouter initialEntries={[INITIAL_ROUTE]}>
    <LinkRememberPassword {...{ email, clickHandler }} />
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

    await waitFor(() =>
      user.click(screen.getByRole('link', { name: /^Sign in/ }))
    );

    expect(mockClickHandler).toHaveBeenCalledTimes(1);
  });

  describe('location state', () => {
    it('updates location with expected state when the link is clicked', async () => {
      // Render the component within a router for testing navigation.
      const { router } = renderWithRouter(
        <LinkRememberPassword email={MOCK_EMAIL} />,
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
      await waitFor(() => user.click(rememberPasswordLink));

      // Check that the pathname is updated if the link has a destination change.
      expect(router.state.location.pathname).toStrictEqual('/');

      expect(router.state.location.state).toMatchObject({
        prefillEmail: MOCK_EMAIL,
      });
    });
  });
});
