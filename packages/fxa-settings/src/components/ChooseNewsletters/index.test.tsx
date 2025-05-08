/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
import { FluentBundle } from '@fluent/bundle';
import { SubjectWithNewsletters, SubjectWithNone } from './mocks';

describe('ChooseNewsletters component', () => {
  let bundle: FluentBundle;
  beforeAll(async () => {
    bundle = await getFtlBundle('settings');
  });
  it('renders newsletter options as expected', async () => {
    renderWithLocalizationProvider(<SubjectWithNewsletters />);
    testAllL10n(screen, bundle);

    screen.getByText('Get more from Mozilla:');

    const checkboxes = await screen.findAllByRole('checkbox');
    expect(checkboxes).toHaveLength(1);
  });

  it('does not render with empty newletters', async () => {
    renderWithLocalizationProvider(<SubjectWithNone />);
    expect(
      screen.queryByText('Get more from Mozilla:')
    ).not.toBeInTheDocument();
  });
});
