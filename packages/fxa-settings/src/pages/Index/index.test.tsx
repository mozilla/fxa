/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import {
  createMockIndexOAuthIntegration,
  createMockIndexOAuthNativeIntegration,
  Subject,
} from './mocks';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { POCKET_CLIENTIDS } from '../../models/integrations/client-matching';
import { MozServices } from '../../lib/types';

const syncText =
  'Sync your passwords, tabs, and bookmarks everywhere you use Firefox.';
const syncTextSecondary =
  'A Mozilla account also unlocks access to more privacy-protecting products from Mozilla.';

function thirdPartyAuthWithSeparatorRendered() {
  screen.getByText('or');
  screen.getByRole('button', {
    name: /Continue with Google/,
  });
  screen.getByRole('button', {
    name: /Continue with Apple/,
  });
}
function thirdPartyAuthNotRendered() {
  expect(
    screen.queryByRole('button', { name: /Continue with Google/ })
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: /Continue with Apple/ })
  ).not.toBeInTheDocument();
}

describe('Index page', () => {
  it('renders as expected with web integration', () => {
    renderWithLocalizationProvider(<Subject />);

    screen.getByRole('heading', { name: 'Enter your email' });
    screen.getByText('Continue to account settings');
    screen.getByLabelText('Enter your email');
    screen.getByRole('button', { name: 'Sign up or sign in' });

    expect(screen.queryByText(syncText)).not.toBeInTheDocument();
    expect(screen.queryByText(syncTextSecondary)).not.toBeInTheDocument();

    thirdPartyAuthWithSeparatorRendered();

    expect(
      screen.getByRole('link', {
        name: /Terms of Service/,
      })
    ).toHaveAttribute('href', '/legal/terms');
  });
  it('renders as expected when sync', () => {
    renderWithLocalizationProvider(
      <Subject
        integration={createMockIndexOAuthNativeIntegration()}
        serviceName={MozServices.FirefoxSync}
      />
    );

    screen.getByRole('heading', { name: 'Continue to your Mozilla account' });
    screen.getByText(syncText);

    screen.getByText(syncTextSecondary);
    thirdPartyAuthNotRendered();

    expect(
      screen.getByRole('link', {
        name: /Terms of Service/,
      })
    ).toHaveAttribute('href', '/legal/terms');
  });

  it('renders as expected with service=relay', () => {
    renderWithLocalizationProvider(
      <Subject
        integration={createMockIndexOAuthNativeIntegration({
          isSync: false,
          isDesktopRelay: true,
        })}
      />
    );

    screen.getByRole('heading', { name: 'Create an email mask' });
    screen.getByText(
      'Please provide the email address where you’d like to forward emails from your masked email.'
    );
    screen.getByRole('button', { name: 'Sign up or sign in' });

    expect(screen.queryByText(syncText)).not.toBeInTheDocument();
    expect(screen.queryByText(syncTextSecondary)).not.toBeInTheDocument();

    thirdPartyAuthNotRendered();

    expect(
      screen.getAllByRole('link', {
        name: /Terms of Service/,
      })[0]
    ).toHaveAttribute(
      'href',
      'https://www.mozilla.org/about/legal/terms/subscription-services/'
    );
  });

  it('renders as expected when client is Pocket', () => {
    renderWithLocalizationProvider(
      <Subject
        integration={createMockIndexOAuthIntegration({
          clientId: POCKET_CLIENTIDS[0],
        })}
        serviceName={MozServices.Pocket}
      />
    );

    screen.getByRole('heading', { name: 'Enter your email' });
    screen.getByAltText('Pocket');

    thirdPartyAuthWithSeparatorRendered();

    const tosLinks = screen.getAllByRole('link', {
      name: /Terms of Service/,
    });

    expect(tosLinks[0]).toHaveAttribute('href', 'https://getpocket.com/tos/');
    expect(tosLinks[1]).toHaveAttribute('href', '/legal/terms');
  });
});
