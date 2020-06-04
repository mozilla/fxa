/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Avatar from '.';

describe('Avatar', () => {
  it('renders default avatar with expected attributes', () => {
    render(<Avatar avatarUrl={null} />);

    expect(screen.getByTestId('avatar-default')).toHaveAttribute('role', 'img');
    expect(screen.getByTestId('avatar-default')).toHaveAttribute(
      'aria-label',
      'Default avatar'
    );
    expect(screen.queryByTestId('avatar-nondefault')).toBeNull();
  });

  it('renders default avatar with a custom className', () => {
    render(<Avatar avatarUrl={null} className="my-class" />);

    expect(screen.getByTestId('avatar-default')).toHaveClass('my-class');
  });

  it('renders the avatar with expected attributes', () => {
    render(<Avatar avatarUrl="some-fake-image.png" />);

    expect(screen.getByTestId('avatar-nondefault')).toHaveAttribute(
      'src',
      'some-fake-image.png'
    );
    expect(screen.getByTestId('avatar-nondefault')).toHaveAttribute(
      'alt',
      'Your avatar'
    );
    expect(screen.queryByTestId('avatar-default')).toBeNull();
  });

  it('renders the avatar with a custom className', () => {
    render(<Avatar avatarUrl="some-fake-image.png" className="my-class" />);

    expect(screen.getByTestId('avatar-nondefault')).toHaveClass('my-class');
  });
});
