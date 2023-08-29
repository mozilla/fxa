/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
import { FluentBundle } from '@fluent/bundle';
import PasswordInfoBalloon from '.';

describe('PasswordInfoBalloon component', () => {
  let bundle: FluentBundle;
  beforeAll(async () => {
    bundle = await getFtlBundle('settings');
  });

  it('renders as expected', () => {
    renderWithLocalizationProvider(<PasswordInfoBalloon />);
    testAllL10n(screen, bundle);
    screen.getByText(
      'You need this password to access any encrypted data you store with us.'
    );
    screen.getByText(
      'A reset means potentially losing data like passwords and bookmarks.'
    );
  });
});
