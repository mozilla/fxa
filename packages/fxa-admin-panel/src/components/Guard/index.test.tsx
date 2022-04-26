/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render } from '@testing-library/react';
import { IClientConfig } from '../../../interfaces';
import { Guard } from './index';
import { AdminPanelFeature, AdminPanelGroup, guard } from 'fxa-shared/guards';
import { mockConfigBuilder } from '../../lib/config';

export const mockConfig: IClientConfig = mockConfigBuilder({
  user: {
    email: 'test@mozilla.com',
    group: guard.getGroup(AdminPanelGroup.SupportAgentProd),
  },
});

jest.mock('../../hooks/UserContext.ts', () => ({
  useUserContext: () => {
    const ctx = {
      user: mockConfig.user,
      setUser: () => {},
    };
    return ctx;
  },
}));

describe('Permissions', () => {
  function renderTest(features: AdminPanelFeature[]) {
    return render(
      <div data-testid="foo">
        <Guard features={features}>bar</Guard>
      </div>
    );
  }

  it('restricts access', async () => {
    const renderResult = renderTest([AdminPanelFeature.DisableAccount]);
    expect(renderResult.getByTestId('foo').textContent).toEqual('');
  });

  it('allows access', () => {
    const renderResult = renderTest([AdminPanelFeature.AccountSearch]);
    expect(renderResult.getByTestId('foo').textContent).toEqual('bar');
  });

  it('allows access if one or more features is allowed', () => {
    const renderResult = renderTest([
      AdminPanelFeature.AccountSearch,
      AdminPanelFeature.DisableAccount,
    ]);
    expect(renderResult.getByTestId('foo').textContent).toEqual('bar');
  });
});
