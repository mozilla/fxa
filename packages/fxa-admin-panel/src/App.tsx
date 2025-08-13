/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useState } from 'react';
import { UserContext } from './hooks/UserContext';
import { GuardContext } from './hooks/GuardContext';
import { Route, Routes, BrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import AccountSearch from './components/PageAccountSearch';
import { PagePermissions } from './components/PagePermissions';
import { IClientConfig, IUserInfo } from '../interfaces';
import { AdminPanelFeature, AdminPanelGuard } from 'fxa-shared/guards';
import PageRelyingParties from './components/PageRelyingParties';
import PageAccountDelete from './components/PageAccountDelete';

const App = ({ config }: { config: IClientConfig }) => {
  const [guard, setGuard] = useState<AdminPanelGuard>(config.guard);
  const [user, setUser] = useState<IUserInfo>(config.user);
  return (
    <BrowserRouter>
      <GuardContext.Provider value={{ guard, setGuard }}>
        <UserContext.Provider value={{ user, setUser }}>
          <AppLayout>
            <Routes>
              {guard.allow(AdminPanelFeature.AccountSearch, user.group) && (
                <>
                  <Route path="/account-search" element={<AccountSearch />} />
                  <Route path="/" element={<Navigate to="/account-search" />} />
                </>
              )}
              {guard.allow(AdminPanelFeature.RelyingParties, user.group) && (
                <Route
                  path="/relying-parties"
                  element={<PageRelyingParties />}
                />
              )}
              {guard.allow(AdminPanelFeature.AccountDelete, user.group) && (
                <Route path="/account-delete" element={<PageAccountDelete />} />
              )}
              <Route path="/permissions" element={<PagePermissions />} />
            </Routes>
          </AppLayout>
        </UserContext.Provider>
      </GuardContext.Provider>
    </BrowserRouter>
  );
};

export default App;
