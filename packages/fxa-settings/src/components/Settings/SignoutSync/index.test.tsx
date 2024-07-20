/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import SignoutSync from '.';
import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { FluentBundle } from '@fluent/bundle';
import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';

describe('SignoutSync', () => {
  let bundle: FluentBundle;
  beforeAll(async () => {
    bundle = await getFtlBundle('settings');
  });

  it('renders as expected', () => {
    renderWithLocalizationProvider(<SignoutSync />);
    testAllL10n(screen, bundle);

    screen.getByText('Session Expired');
    screen.getByText(
      'Sorry, something went wrong. Please sign out from the browser menu and try again.'
    );
  });
});
