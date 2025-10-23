/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FluentBundle } from '@fluent/bundle';
import { screen } from '@testing-library/react';
import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
import { Profile } from '.';
import { AppContext } from '../../../models';
import { mockAppContext, renderWithRouter } from '../../../models/mocks';
import { MOCK_PROFILE_EMPTY } from './mocks';

describe('Profile', () => {
  let bundle: FluentBundle;
  beforeAll(async () => {
    bundle = await getFtlBundle('settings');
  });

  it('renders "fresh load" <Profile/> with correct content', async () => {
    renderWithRouter(
      <AppContext.Provider
        value={mockAppContext({ account: MOCK_PROFILE_EMPTY })}
      >
        <Profile />
      </AppContext.Provider>
    );
    testAllL10n(screen, bundle);

    await screen.findByAltText('Default avatar');
    expect(await screen.findAllByText('None')).toHaveLength(2);
    await screen.findByText('johndope@example.com');
  });
});
