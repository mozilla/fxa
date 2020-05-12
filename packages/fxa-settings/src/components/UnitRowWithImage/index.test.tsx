/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import UnitRowWithImage from '.';

afterEach(cleanup);

describe('UnitRowWithImage', () => {
  it('renders as expected with the default avatar', () => {
    const { getByTestId, queryByTestId } = render(
      <UnitRowWithImage
        header="Avatar"
        imageUrl={null}
        alt="Your avatar"
        route="/change_avatar"
      />
    );

    expect(getByTestId('unit-row-with-image-header').textContent).toContain(
      'Avatar'
    );
    expect(getByTestId('unit-row-with-image-route').textContent).toContain(
      'Add'
    );
    expect(getByTestId('unit-row-with-image-route')).toHaveAttribute(
      'href',
      '/change_avatar'
    );
    expect(getByTestId('unit-row-with-image-default')).toHaveAttribute(
      'role',
      'img'
    );
    expect(getByTestId('unit-row-with-image-default')).toHaveAttribute(
      'aria-label',
      'Your avatar'
    );
    expect(queryByTestId('unit-row-with-image-nondefault')).toBeNull();
  });

  it('renders as expected with the user avatar', () => {
    const { getByTestId, queryByTestId } = render(
      <UnitRowWithImage
        header="Avatar"
        imageUrl="some-fake-image.png"
        alt="Your avatar"
        route="/change_avatar"
      />
    );

    expect(getByTestId('unit-row-with-image-route').textContent).toContain(
      'Change'
    );
    expect(getByTestId('unit-row-with-image-nondefault')).toHaveAttribute(
      'src',
      'some-fake-image.png'
    );
    expect(getByTestId('unit-row-with-image-nondefault')).toHaveAttribute(
      'alt',
      'Your avatar'
    );
    expect(queryByTestId('unit-row-with-image-default')).toBeNull();
  });
});
