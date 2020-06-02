/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import UnitRowWithAvatar from '.';

afterEach(cleanup);

describe('UnitRowWithAvatar', () => {
  it('renders as expected with the default avatar', () => {
    const { getByTestId, queryByTestId } = render(
      <UnitRowWithAvatar avatarUrl={null} />
    );

    expect(getByTestId('unit-row-with-avatar-route').textContent).toContain(
      'Add'
    );
    expect(getByTestId('unit-row-with-avatar-default')).toHaveAttribute(
      'role',
      'img'
    );
    expect(getByTestId('unit-row-with-avatar-default')).toHaveAttribute(
      'aria-label',
      'Default avatar'
    );
    expect(queryByTestId('unit-row-with-avatar-nondefault')).toBeNull();
  });

  it('renders as expected with the user avatar', () => {
    const { getByTestId, queryByTestId } = render(
      <UnitRowWithAvatar avatarUrl="some-fake-image.png" />
    );

    expect(getByTestId('unit-row-with-avatar-route').textContent).toContain(
      'Change'
    );
    expect(getByTestId('unit-row-with-avatar-nondefault')).toHaveAttribute(
      'src',
      'some-fake-image.png'
    );
    expect(getByTestId('unit-row-with-avatar-nondefault')).toHaveAttribute(
      'alt',
      'Your avatar'
    );
    expect(queryByTestId('unit-row-with-avatar-default')).toBeNull();
  });
});
