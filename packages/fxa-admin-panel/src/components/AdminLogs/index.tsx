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
        done on any user account.
      </p>
      <br />
      <hr />
      <br />
      <p>There are currently no administrative changes to display.</p>
      <br />
      <div class="pagination">
        <a href="#">&laquo;</a>
        <a class="active" href="#">
          1
        </a>
        <a href="#">2</a>
        <a href="#">3</a>
        <a href="#">4</a>
        <a href="#">5</a>
        <a href="#">6</a>
        <a href="#">&raquo;</a>
      </div>
      <br />
      <br />
    </div>
  );
};

export default AdminLogs;
