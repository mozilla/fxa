/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Route, Routes, BrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import AccountSearch from './components/AccountSearch';
import Permissions from './components/Permissions';
import AdminLogs from './components/AdminLogs';
import SiteStatus from './components/SiteStatus';
import { IUserInfo } from '../interfaces';

const App = ({ user }: { user: IUserInfo }) => (
  <BrowserRouter>
    <AppLayout>
      <Routes>
        <Route path="/admin-logs" element={<AdminLogs />} />
        <Route path="/site-status" element={<SiteStatus />} />
        <Route path="/permissions" element={<Permissions {...{ user }} />} />
        <Route path="/account-search" element={<AccountSearch />} />
        <Route path="/" element={<Navigate to="/account-search" />} />
      </Routes>
    </AppLayout>
  </BrowserRouter>
);

export default App;
