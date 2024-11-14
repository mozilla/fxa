/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import Avatar from '.';
import {
  MOCK_AVATAR_DEFAULT,
  MOCK_AVATAR_NON_DEFAULT,
  PLACEHOLDER_IMAGE_URL,
} from '../../../pages/mocks';

describe('Avatar', () => {
  it('renders default avatar with expected attributes', () => {
    renderWithLocalizationProvider(<Avatar avatar={MOCK_AVATAR_DEFAULT} />);

    expect(screen.getByTestId('avatar-default')).toHaveAttribute(
      'alt',
      'Default avatar'
    );
    expect(screen.queryByTestId('avatar-nondefault')).toBeNull();
  });

  it('renders default avatar with a custom className', () => {
    renderWithLocalizationProvider(
      <Avatar className="my-class" avatar={MOCK_AVATAR_DEFAULT} />
    );

    expect(screen.getByTestId('avatar-default')).toHaveClass('my-class');
  });

  it('renders the avatar with expected attributes', () => {
    renderWithLocalizationProvider(<Avatar avatar={MOCK_AVATAR_NON_DEFAULT} />);

    expect(screen.getByTestId('avatar-nondefault')).toHaveAttribute(
      'src',
      PLACEHOLDER_IMAGE_URL
    );
    expect(screen.getByTestId('avatar-nondefault')).toHaveAttribute(
      'alt',
      'Your avatar'
    );
    expect(screen.queryByTestId('avatar-default')).toBeNull();
  });

  it('renders the avatar with a custom className', () => {
    renderWithLocalizationProvider(
      <Avatar className="my-class" avatar={MOCK_AVATAR_NON_DEFAULT} />
    );

    expect(screen.getByTestId('avatar-nondefault')).toHaveClass('my-class');
  });
});
