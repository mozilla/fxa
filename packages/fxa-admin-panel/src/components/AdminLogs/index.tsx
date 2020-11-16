/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import './index.scss';

export const AdminLogs = () => {
  return (
    <div className="admin-logs">
      <h2>Admin Logs</h2>
      <p>
        This is a read-only view of all administrative changes that have been
        done to any user account.
      </p>
    </div>
  );
};

export default AdminLogs;
