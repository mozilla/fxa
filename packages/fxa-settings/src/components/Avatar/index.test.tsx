/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { AppContext } from '../../models';
import { MOCK_AVATAR_DEFAULT, MOCK_AVATAR_NON_DEFAULT } from './mocks';
import Avatar from '.';

describe('Avatar', () => {
  it('renders default avatar with expected attributes', () => {
    render(
      <AppContext.Provider value={{ account: MOCK_AVATAR_DEFAULT }}>
        <Avatar />
      </AppContext.Provider>
    );

    expect(screen.getByTestId('avatar-default')).toHaveAttribute(
      'alt',
      'Default avatar'
    );
    expect(screen.queryByTestId('avatar-nondefault')).toBeNull();
  });

  it('renders default avatar with a custom className', () => {
    render(
      <AppContext.Provider value={{ account: MOCK_AVATAR_DEFAULT }}>
        <Avatar className="my-class" />
      </AppContext.Provider>
    );

    expect(screen.getByTestId('avatar-default')).toHaveClass('my-class');
  });

  it('renders the avatar with expected attributes', () => {
    render(
      <AppContext.Provider value={{ account: MOCK_AVATAR_NON_DEFAULT }}>
        <Avatar />
      </AppContext.Provider>
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
      <AppContext.Provider value={{ account: MOCK_AVATAR_NON_DEFAULT }}>
        <Avatar className="my-class" />
      </AppContext.Provider>
    );

    expect(screen.getByTestId('avatar-nondefault')).toHaveClass('my-class');
  });
});
