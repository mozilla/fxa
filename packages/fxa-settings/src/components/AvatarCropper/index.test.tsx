/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen } from '@testing-library/react';
import picture from '../Avatar/avatar-default.svg';
import AvatarCropper from '.';

describe('AvatarCropper', () => {
  it('renders default avatar with expected attributes', () => {
    render(<AvatarCropper src={picture} />);

    const zoomOutButton = screen.getByTestId('zoom-out-btn');
    expect(zoomOutButton).toBeInTheDocument();

    const zoomInButton = screen.getByTestId('zoom-in-btn');
    expect(zoomInButton).toBeInTheDocument();

    const rotateButton = screen.getByTestId('rotate-btn');
    expect(rotateButton).toBeInTheDocument();
  });
});
