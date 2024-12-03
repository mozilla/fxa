/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import TermsPrivacyAgreement from '.';
// import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';

// TODO: Once https://mozilla-hub.atlassian.net/browse/FXA-6461 is resolved, we can
// add the l10n tests back in. Right now, they can't handle embedded tags.

function testSubscriptionTos() {
  const linkElements: HTMLElement[] = screen.getAllByRole('link');

  screen.getByText('By proceeding, you agree to the:');
  screen.getByText('Mozilla Subscription Services', { exact: false });
  screen.getByText('Mozilla Accounts', { exact: false });
  expect(linkElements).toHaveLength(4);
  expect(linkElements[0]).toHaveAttribute(
    'href',
    'https://www.mozilla.org/about/legal/terms/subscription-services/'
  );
  expect(linkElements[1]).toHaveAttribute(
    'href',
    'https://www.mozilla.org/privacy/subscription-services/'
  );
  expect(linkElements[2]).toHaveAttribute('href', '/legal/terms');
  expect(linkElements[3]).toHaveAttribute('href', '/legal/privacy');
}

describe('TermsPrivacyAgreement', () => {
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });
  it('renders the default component as expected', () => {
    renderWithLocalizationProvider(<TermsPrivacyAgreement />);
    // testAllL10n(screen, bundle);

    const linkElements: HTMLElement[] = screen.getAllByRole('link');

    expect(linkElements[0]).toHaveAttribute('href', '/legal/terms');
    expect(linkElements[1]).toHaveAttribute('href', '/legal/privacy');
  });

  it('renders component as expected for Pocket clients', () => {
    renderWithLocalizationProvider(<TermsPrivacyAgreement isPocketClient />);
    // testAllL10n(screen, bundle);

    const linkElements: HTMLElement[] = screen.getAllByRole('link');

    expect(linkElements).toHaveLength(4);
    expect(linkElements[0]).toHaveAttribute(
      'href',
      'https://getpocket.com/tos/'
    );
    expect(linkElements[1]).toHaveAttribute(
      'href',
      'https://getpocket.com/privacy/'
    );
    expect(linkElements[2]).toHaveAttribute('href', '/legal/terms');
    expect(linkElements[3]).toHaveAttribute('href', '/legal/privacy');
  });
});

it('renders component as expected for Monitor clients', () => {
  renderWithLocalizationProvider(<TermsPrivacyAgreement isMonitorClient />);
  // testAllL10n(screen, bundle);

  testSubscriptionTos();
});

it('renders component as expected when service=relay', () => {
  renderWithLocalizationProvider(<TermsPrivacyAgreement isDesktopRelay />);
  // testAllL10n(screen, bundle);

  testSubscriptionTos();
});
