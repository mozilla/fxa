/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createContext, useContext } from 'react';
import { AdminPanelGuard } from 'fxa-shared/guards';

export interface IGuardContext {
  guard: AdminPanelGuard;
  setGuard: (guard: AdminPanelGuard) => void;
}

let _guard = new AdminPanelGuard();
export const GuardContext = createContext<IGuardContext>({
  guard: _guard,
  setGuard: (guard: AdminPanelGuard) => {
    _guard = guard;
  },
});

export const useGuardContext = () => useContext(GuardContext);
