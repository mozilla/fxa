/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { FeatureFlag } from '.';

describe('Feature Flag', () => {
  const enabled = (feature: string) => {
    return feature === 'foo';
  };

  it('enables', async () => {
    render(
      <FeatureFlag
        {...{
          feature: 'foo',
          enabled,
        }}
      >
        <h1>foo</h1>
        <p>bar</p>
      </FeatureFlag>
    );

    expect(screen.queryByText('foo')).toBeDefined();
    expect(screen.queryByText('bar')).toBeDefined();
  });

  it('disables', async () => {
    <FeatureFlag
      {...{
        feature: 'bar',
        enabled,
      }}
    >
      <h1>foo</h1>
      <p>bar</p>
    </FeatureFlag>;

    expect(screen.queryByText('foo')).toBeNull();
    expect(screen.queryByText('bar')).toBeNull();
  });
});
