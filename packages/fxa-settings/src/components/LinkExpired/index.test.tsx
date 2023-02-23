/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen } from '@testing-library/react';
import LinkExpired from '.';

describe('LinkExpired', () => {

  let handler:()=>Promise<void>;

  beforeAll(() => {
    handler = jest.fn();
  })

  it('renders the component as expected for an expired Reset Password link', () => {
    render(<LinkExpired linkType="reset-password" resendLinkHandler={handler} />);

    screen.getByRole('heading', {
      name: 'Reset password link expired',
    });
    screen.getByText('The link you clicked to reset your password is expired.');
    screen.getByRole('button', {
      name: 'Receive new link',
    });
  });

  it('renders the component as expected for an expired Signin link', () => {
    render(<LinkExpired linkType="signin" resendLinkHandler={handler} />);

    screen.getByRole('heading', {
      name: 'Confirmation link expired',
    });
    screen.getByText('The link you clicked to confirm your email is expired.');
    screen.getByRole('button', {
      name: 'Receive new link',
    });
  });

  it('fires the handler', () => {
    render(<LinkExpired linkType="signin" resendLinkHandler={handler} />);
    screen.getByRole('button', {
      name: 'Receive new link',
    }).click();
    expect(handler).toBeCalled();
  })
});
