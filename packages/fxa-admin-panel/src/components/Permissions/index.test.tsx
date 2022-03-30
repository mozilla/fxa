/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, RenderResult } from '@testing-library/react';
import { IUserInfo } from '../../../interfaces';
import { Permissions } from './index';

const testUser: IUserInfo = {
  email: 'test@mozilla.com',
  group: 'vpn_fxa_admin_panel_prod',
  permissions: {
    p1: {
      name: 'Feature 1',
      enabled: true,
    },
    p2: {
      name: 'Feature 2',
      enabled: false,
    },
  },
};

describe('rendered', () => {
  let renderResult: RenderResult;

  beforeEach(() => {
    renderResult = render(<Permissions {...{ user: testUser }} />);
  });

  function getByTestId(id: string) {
    return renderResult.getByTestId(id);
  }

  it('has user email', () => {
    expect(getByTestId('permissions-user-email-val').textContent).toEqual(
      testUser.email
    );
  });

  it('has user group', () => {
    expect(getByTestId('permissions-user-group-val').textContent).toEqual(
      testUser.group
    );
  });

  it('has enabled feature', () => {
    expect(getByTestId('permissions-row-p1-label').textContent).toEqual(
      testUser.permissions.p1.name
    );
    expect(getByTestId('permissions-row-p1-val').textContent).toEqual('✓');
  });

  it('has disabled feature', () => {
    expect(getByTestId('permissions-row-p2-label').textContent).toEqual(
      testUser.permissions.p2.name
    );
    expect(getByTestId('permissions-row-p2-val').textContent).toEqual('x');
  });
});
