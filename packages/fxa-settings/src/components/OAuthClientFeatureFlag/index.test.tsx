/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { render, screen } from '@testing-library/react';
import { OAuthClientFeatureFlag } from '.';

jest.mock('../../lib/config', () => ({
  oauth: {
    reactClientIdsEnabled: ['foo123'],
  },
}));

describe('OAuthClientFeatureFlag component', () => {
  it('shows for a supported clientId', () => {
    render(
      <OAuthClientFeatureFlag
        {...{
          clientId: 'foo123',
        }}
      >
        <h1>foo</h1>
      </OAuthClientFeatureFlag>
    );
    expect(screen.queryByText('foo')).toBeDefined();
  });

  it('hides for an unsupported clientId', () => {
    render(
      <OAuthClientFeatureFlag
        {...{
          clientId: 'bar123',
        }}
      >
        <h1>foo</h1>
      </OAuthClientFeatureFlag>
    );
    expect(screen.queryByText('foo')).toBeNull();
  });
});
