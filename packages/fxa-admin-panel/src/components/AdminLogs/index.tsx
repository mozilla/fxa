/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { AdminPanelFeature } from 'fxa-shared/guards';
import Guard from '../Guard';

export const AdminLogs = () => {
  return (
    <Guard features={[AdminPanelFeature.AccountLogs]}>
      <div className="text-grey-600">
        <h2 className="text-lg font-semibold mb-2">Admin Logs</h2>
        <p className="mb-2">
          This is a read-only view of all administrative changes that have been
          done to any user account.
        </p>
        <p>⚠️ This page is not complete.</p>
      </div>
    </Guard>
  );
};

export default AdminLogs;
