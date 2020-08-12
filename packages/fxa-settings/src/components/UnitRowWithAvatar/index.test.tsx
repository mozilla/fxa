/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen } from '@testing-library/react';
import UnitRowWithAvatar from '.';
import { renderWithRouter } from '../../models/_mocks';

describe('UnitRowWithAvatar', () => {
  it('renders as expected with the default avatar', () => {
    renderWithRouter(<UnitRowWithAvatar avatarUrl={null} />);

    expect(
      screen.getByTestId('unit-row-with-avatar-route').textContent
    ).toContain('Add');
    expect(screen.getByTestId('avatar-default')).toBeInTheDocument;
    expect(screen.queryByTestId('avatar-nondefault')).toBeNull();
  });

  it('renders as expected with the user avatar', () => {
    renderWithRouter(<UnitRowWithAvatar avatarUrl="some-fake-image.png" />);

    expect(
      screen.getByTestId('unit-row-with-avatar-route').textContent
    ).toContain('Change');

    expect(screen.getByTestId('avatar-nondefault')).toBeInTheDocument;
    expect(screen.queryByTestId('avatar-default')).toBeNull();
  });
});
