/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, RenderResult } from '@testing-library/react';
import { IClientConfig } from '../../../interfaces';
import { Permissions } from './index';
import { AdminPanelGroup, guard } from 'fxa-shared/guards';
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
  let renderResult: RenderResult;

  beforeEach(() => {
    renderResult = render(<Permissions />);
  });

  function getByTestId(id: string) {
    return renderResult.getByTestId(id);
  }

  it('has user email', () => {
    expect(getByTestId('permissions-user-email-val').textContent).toEqual(
      mockConfig.user.email
    );
  });

  it('has user group', () => {
    expect(getByTestId('permissions-user-group-val').textContent).toEqual(
      mockConfig.user.group.name
    );
  });

  it('has enabled feature', () => {
    const enabledFeature = guard
      .getFeatureFlags(mockConfig.user.group)
      .find((x) => x.enabled);

    expect(enabledFeature).toBeDefined();
    expect(
      getByTestId(`permissions-row-${enabledFeature?.id}-label`).textContent
    ).toEqual(enabledFeature?.name);
    expect(
      getByTestId(`permissions-row-${enabledFeature?.id}-val`).textContent
    ).toEqual('✓');
  });

  it('has disabled feature', () => {
    const disabledFeature = guard
      .getFeatureFlags(mockConfig.user.group)
      .find((x) => !x.enabled);

    expect(disabledFeature).toBeDefined();
    expect(
      getByTestId(`permissions-row-${disabledFeature?.id}-label`).textContent
    ).toEqual(disabledFeature?.name);
    expect(
      getByTestId(`permissions-row-${disabledFeature?.id}-val`).textContent
    ).toEqual('x');
  });
});
