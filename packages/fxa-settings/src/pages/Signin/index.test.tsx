/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import Signin, { viewName } from '.';
import { usePageViewEvent } from '../../lib/metrics';
// import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';
import { MOCK_EMAIL, MOCK_SERVICE } from './mocks';
import { MozServices } from '../../lib/types';
import { REACT_ENTRYPOINT } from '../../constants';
jest.mock('../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
  logViewEventOnce: jest.fn(),
  useMetrics: () => ({
    usePageViewEvent: jest.fn(),
    logViewEvent: jest.fn(),
    logViewEventOnce: jest.fn(),
  }),
}));

// TODO: Once https://mozilla-hub.atlassian.net/browse/FXA-6461 is resolved, we can
// add the l10n tests back in. Right now, they can't handle embedded tags.

describe('Signin', () => {
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });
  it('renders Signin page as expected with password required', () => {
    renderWithLocalizationProvider(
      <Signin
        email={MOCK_EMAIL}
        isPasswordNeeded={true}
        serviceName={MOCK_SERVICE}
      />
    );
    // testAllL10n(screen, bundle);

    const signinHeader = screen.getByRole('heading', {
      name: 'Enter your password for your Mozilla account',
    });
    const passwordInputForm = screen.getByLabelText('Password');
    const firefoxTermsLink: HTMLElement = screen.getByRole('link', {
      name: 'Terms of Service',
    });
    const firefoxPrivacyLink: HTMLElement = screen.getByRole('link', {
      name: 'Privacy Notice',
    });

    expect(signinHeader).toBeInTheDocument();
    expect(passwordInputForm).toBeInTheDocument();
    expect(firefoxTermsLink).toHaveAttribute('href', '/legal/terms');
    expect(firefoxPrivacyLink).toHaveAttribute('href', '/legal/privacy');
  });

  it('renders Signin page as expected with password not required', () => {
    renderWithLocalizationProvider(
      <Signin
        email={MOCK_EMAIL}
        isPasswordNeeded={false}
        serviceName={MOCK_SERVICE}
      />
    );
    // testAllL10n(screen, bundle);

    const signinHeader = screen.getByRole('heading', {
      name: 'Sign in',
    });
    const passwordInputForm = screen.queryByLabelText('Password');

    expect(signinHeader).toBeInTheDocument();
    expect(passwordInputForm).not.toBeInTheDocument();
  });

  it('renders Signin page with Pocket client as expected', () => {
    renderWithLocalizationProvider(
      <Signin
        email={MOCK_EMAIL}
        isPasswordNeeded={false}
        serviceName={MozServices.Pocket}
      />
    );
    // testAllL10n(screen, bundle);

    const signinHeader = screen.getByRole('heading', {
      name: 'Sign in',
    });
    const passwordInputForm = screen.queryByLabelText('Password');
    const pocketLogo = screen.getByLabelText('Pocket');

    expect(signinHeader).toBeInTheDocument();
    expect(pocketLogo).toBeInTheDocument();
    expect(passwordInputForm).not.toBeInTheDocument();

    // Pocket links should always open in a new window (announced by screen readers)
    const pocketTermsLink = screen.getByRole('link', {
      name: 'Terms of Service Opens in new window',
    });
    const pocketPrivacyLink = screen.getByRole('link', {
      name: 'Privacy Notice Opens in new window',
    });

    expect(pocketTermsLink).toHaveAttribute(
      'href',
      'https://getpocket.com/tos/'
    );
    expect(pocketPrivacyLink).toHaveAttribute(
      'href',
      'https://getpocket.com/privacy/'
    );
  });

  it('emits the expected metrics on render', () => {
    renderWithLocalizationProvider(
      <Signin
        email={MOCK_EMAIL}
        isPasswordNeeded={false}
        serviceName={MOCK_SERVICE}
      />
    );
    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
  });
});
