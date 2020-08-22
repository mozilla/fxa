/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import UnitRowWithAvatar from '.';
import { MockedCache } from '../../models/_mocks';
import { renderWithRouter } from '../../models/_mocks';

describe('UnitRowWithAvatar', () => {
  it('renders as expected with the default avatar', () => {
    renderWithRouter(
      <MockedCache account={{ avatarUrl: null }}>
        <UnitRowWithAvatar />
      </MockedCache>
    );

    expect(
      screen.getByTestId('unit-row-with-avatar-route').textContent
    ).toContain('Add');
    expect(screen.getByTestId('avatar-default')).toBeInTheDocument;
    expect(screen.queryByTestId('avatar-nondefault')).toBeNull();
  });

  it('renders as expected with the user avatar', () => {
    renderWithRouter(
      <MockedCache>
        <UnitRowWithAvatar />
      </MockedCache>
    );

    expect(
      screen.getByTestId('unit-row-with-avatar-route').textContent
    ).toContain('Change');

    expect(screen.getByTestId('avatar-nondefault')).toBeInTheDocument;
    expect(screen.queryByTestId('avatar-default')).toBeNull();
  });
});
