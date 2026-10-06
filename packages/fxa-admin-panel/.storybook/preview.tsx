/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import type { Preview } from '@storybook/react';
import { MemoryRouter } from 'react-router';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { AdminPanelGroup, AdminPanelGuard } from '@fxa/shared/guards';
import { UserContext } from '../src/hooks/UserContext';
import { GuardContext } from '../src/hooks/GuardContext';
import { resetAdminApi } from '../src/lib/storybook';
import '../src/styles/tailwind.out.css';

const guard = new AdminPanelGuard();
const user = {
  email: 'user@example.com',
  group: guard.getGroup(AdminPanelGroup.AdminProd),
};

const preview: Preview = {
  loaders: [resetAdminApi],
  decorators: [
    withLocalization,
    (Story) => (
      <MemoryRouter>
        <UserContext.Provider value={{ user, setUser: () => {} }}>
          <GuardContext.Provider value={{ guard, setGuard: () => {} }}>
            <Story />
          </GuardContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>
    ),
  ],
};

export default preview;
