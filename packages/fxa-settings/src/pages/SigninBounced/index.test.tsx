/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '../../models/mocks';
// import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';
import SigninBounced from '.';
import { logPageViewEvent } from '../../lib/metrics';
import { MOCK_EMAIL } from './mocks';

jest.mock('../../lib/metrics', () => ({
  logViewEvent: jest.fn(),
  logPageViewEvent: jest.fn(),
}));

describe('SigninBounced', () => {
  // TODO: enable l10n tests when they've been updated to handle embedded tags in ftl strings
  //       in FXA-6461
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });
  it('renders default content as expected', () => {
    renderWithRouter(<SigninBounced email={MOCK_EMAIL} />);
    // testAllL10n(screen, bundle, {
    //   email:MOCK_EMAIL,
    // });
    screen.getByRole('heading', {
      name: 'Sorry. We’ve locked your\xa0account.',
    });
    // 'let us know' is what is visible when the user reads this visually.
    // 'Opens in new window' is text appended automatically by the LinkExternal component for screenreaders
    const supportLink = screen.getByRole('link', {
      name: 'let us know Opens in new window',
    });
    expect(supportLink).toBeInTheDocument();
  });

  it('renders the "Back" button when a user can go back', () => {
    renderWithRouter(<SigninBounced email={MOCK_EMAIL} canGoBack={true} />);
    const backButton = screen.getByRole('button', { name: 'Back' });
    expect(backButton).toBeInTheDocument();
  });

  it('emits the expected metrics on render', async () => {
    renderWithRouter(<SigninBounced email={MOCK_EMAIL} />);
    expect(logPageViewEvent).toHaveBeenCalledWith('signin-bounced', {
      entrypoint_variation: 'react',
    });
  });
});
