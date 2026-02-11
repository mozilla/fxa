/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import LinkRememberPassword, { LinkRememberPasswordProps } from '.';
import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
import { FluentBundle } from '@fluent/bundle';
import { MOCK_CLIENT_ID, MOCK_EMAIL } from '../../pages/mocks';
import {
  createHistory,
  createMemorySource,
  LocationProvider,
} from '@reach/router';
import userEvent from '@testing-library/user-event';

jest.mock('../../lib/glean', () => ({
  __esModule: true,
  default: {
    passwordReset: {
      emailConfirmationSignin: jest.fn(),
    },
  },
}));

const mockLocation = () => {
  return {
    search: '?' + new URLSearchParams({ client_id: MOCK_CLIENT_ID }),
  };
};

jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useLocation: () => mockLocation(),
}));

const Subject = ({
  email = MOCK_EMAIL,
  clickHandler,
}: Partial<LinkRememberPasswordProps>) => (
  <LocationProvider>
    <LinkRememberPassword {...{ email, clickHandler }} />
  </LocationProvider>
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
    beforeEach(() => {
      jest.unmock('@reach/router');
    });

    it('updates location with expected state when the link is clicked', async () => {
      // Create a custom memory source and history for testing navigation.
      const source = createMemorySource('/some-start-route');
      const history = createHistory(source);

      // Render the component within the LocationProvider that uses custom history.
      renderWithLocalizationProvider(
        <LocationProvider history={history}>
          <LinkRememberPassword email={MOCK_EMAIL} />
        </LocationProvider>
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
      expect(history.location.pathname).toStrictEqual('/');

      expect(history.location.state).toMatchObject({
        prefillEmail: MOCK_EMAIL,
      });
    });
  });
});
