/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Security from '.';

describe('Security', () => {
  it('renders "fresh load" <Security/> with correct content', async () => {
    const { findByText, findAllByText } = render(
      <Security
        accountRecoveryKeyEnabled={false}
        twoFactorAuthEnabled={false}
      />
    );

    expect(await findByText('Recovery key')).toBeTruthy;
    expect(await findByText('Two-step authentication')).toBeTruthy;

    const result = await findAllByText('Not Set');
    expect(result).toHaveLength(2);
  });

  it('renders "enabled two factor" and "recovery key present" <Security/> with correct content', async () => {
    const { findAllByText } = render(
      <Security accountRecoveryKeyEnabled={true} twoFactorAuthEnabled={true} />
    );

    const result = await findAllByText('Enabled');
    expect(result).toHaveLength(2);
  });
});
