/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider'; // import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';
import { Subject } from './mocks';

jest.mock('../../lib/metrics', () => ({
  logViewEvent: jest.fn(),
}));

describe('FormVerifyCode component', () => {
  // TODO: enable l10n tests when they've been updated to handle embedded tags in ftl strings
  // TODO: in FXA-6461
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });

  it('renders as expected', () => {
    renderWithLocalizationProvider(<Subject />);
    // testAllL10n(screen, bundle);
    screen.getByRole('textbox', { name: 'Enter your 4-digit code' });

    screen.getByRole('button', { name: 'Check that code' });
  });

  // TODO Add tests for (engage, success, etc.) metrics events once submit button enabled
});
