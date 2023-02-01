/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';
import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
import { FluentBundle } from '@fluent/bundle';
import { Subject } from './mocks';
import { newsletters } from './newsletters';

describe('ChooseNewsletters component', () => {
  let bundle: FluentBundle;
  beforeAll(async () => {
    bundle = await getFtlBundle('settings');
  });
  it('renders newsletter options as expected', async () => {
    render(<Subject />);
    testAllL10n(screen, bundle);

    screen.getByText(
      'Practical knowledge is coming to your inbox. Sign up for more:'
    );

    const checkboxes = await screen.findAllByRole('checkbox');
    expect(checkboxes).toHaveLength(newsletters.length);
  });
});
