/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { MOCK_ACCOUNT, renderWithRouter } from '../../../models/mocks';
// import { getFtlBundle, testL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';
import SigninBounced, { viewName } from '.';
import { usePageViewEvent, logViewEvent } from '../../../lib/metrics';
import { REACT_ENTRYPOINT } from '../../../constants';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
}));

describe('SigninBounced', () => {
  // TODO: enable l10n tests when they've been updated to handle embedded tags in ftl strings
  //       in FXA-6461
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });
  const originalWindow = window;

  beforeEach(() => {
    //@ts-ignore
    delete window.location;
    window.location = {
      ...window.location,
      replace: jest.fn(),
    };
  });
  afterAll(() => {
    window.location = originalWindow.location;
  });
  it('renders default content as expected', () => {
    renderWithRouter(
      <SigninBounced
        email={MOCK_ACCOUNT.primaryEmail.email}
        emailLookupComplete
      />
    );
    // testAllL10n(screen, bundle, {
    //   email:MOCK_EMAIL,
    // });
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
      <SigninBounced
        email={MOCK_ACCOUNT.primaryEmail.email}
        canGoBack
        emailLookupComplete
      />
    );
    const backButton = screen.getByRole('button', { name: 'Back' });
    expect(backButton).toBeInTheDocument();
  });

  it('emits the expected metrics on render', async () => {
    renderWithRouter(
      <SigninBounced
        email={MOCK_ACCOUNT.primaryEmail.email}
        emailLookupComplete
      />
    );
    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
  });

  it('emits the expected metrics on the "Create Account" action', () => {
    renderWithRouter(
      <SigninBounced
        email={MOCK_ACCOUNT.primaryEmail.email}
        emailLookupComplete
      />
    );
    fireEvent.click(screen.getByTestId('signin-bounced-create-account-btn'));
    expect(logViewEvent).toHaveBeenCalledWith(
      viewName,
      'link.create-account',
      REACT_ENTRYPOINT
    );
  });

  it('pushes the user to the /signin page if there is no email address available', async () => {
    renderWithRouter(<SigninBounced emailLookupComplete />);
    await expect(window.location.replace).toHaveBeenCalled();
  });

  it('does not push the user back to the /signin page until the email has finished being checked', () => {
    renderWithRouter(<SigninBounced emailLookupComplete={false} />);
    expect(window.location.replace).not.toHaveBeenCalled();
  });
});
