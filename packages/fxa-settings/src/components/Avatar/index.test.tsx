/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MockedCache } from '../../models/_mocks';
import Avatar from '.';

describe('Avatar', () => {
  it('renders default avatar with expected attributes', () => {
    render(
      <MockedCache account={{ avatarUrl: null }}>
        <Avatar />
      </MockedCache>
    );

    expect(screen.getByTestId('avatar-default')).toHaveAttribute('role', 'img');
    expect(screen.getByTestId('avatar-default')).toHaveAttribute(
      'aria-label',
      'Default avatar'
    );
    expect(screen.queryByTestId('avatar-nondefault')).toBeNull();
  });

  it('renders default avatar with a custom className', () => {
    render(
      <MockedCache account={{ avatarUrl: null }}>
        <Avatar className="my-class" />
      </MockedCache>
    );

    expect(screen.getByTestId('avatar-default')).toHaveClass('my-class');
  });

  it('renders the avatar with expected attributes', () => {
    render(
      <MockedCache>
        <Avatar />
      </MockedCache>
    );

    expect(screen.getByTestId('avatar-nondefault')).toHaveAttribute(
      'src',
      'http://placekitten.com/512/512'
    );
    expect(screen.getByTestId('avatar-nondefault')).toHaveAttribute(
      'alt',
      'Your avatar'
    );
    expect(screen.queryByTestId('avatar-default')).toBeNull();
  });

  it('renders the avatar with a custom className', () => {
    render(
      <MockedCache>
        <Avatar className="my-class" />
      </MockedCache>
    );

    expect(screen.getByTestId('avatar-nondefault')).toHaveClass('my-class');
  });
});
