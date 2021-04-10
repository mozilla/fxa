/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Account, AppContext } from '../../models';
import Avatar from '.';

const account = ({
  avatar: { url: null, id: null },
} as unknown) as Account;

describe('Avatar', () => {
  it('renders default avatar with expected attributes', () => {
    render(
      <AppContext.Provider value={{ account }}>
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
      <AppContext.Provider value={{ account }}>
        <Avatar className="my-class" />
      </AppContext.Provider>
    );

    expect(screen.getByTestId('avatar-default')).toHaveClass('my-class');
  });

  it('renders the avatar with expected attributes', () => {
    const account = ({
      avatar: { id: 'abc1234', url: 'http://placekitten.com/512/512' },
    } as unknown) as Account;
    render(
      <AppContext.Provider value={{ account }}>
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
    const account = ({
      avatar: { id: 'abc1234', url: 'http://placekitten.com/512/512' },
    } as unknown) as Account;
    render(
      <AppContext.Provider value={{ account }}>
        <Avatar className="my-class" />
      </AppContext.Provider>
    );

    expect(screen.getByTestId('avatar-nondefault')).toHaveClass('my-class');
  });
});
