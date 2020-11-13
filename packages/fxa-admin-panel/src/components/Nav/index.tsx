/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { NavLink } from 'react-router-dom';
import './index.scss';
import mailIcon from '../../images/icon-mail.svg';
import statusIcon from '../../images/icon-site-status.svg';
import logsIcon from '../../images/icon-logs.svg';

export const Nav = () => (
  <nav>
    <div className="nav-container">
      <h2>Navigation</h2>
      <ul>
        <li>
          <NavLink exact to="/account-search">
            <img
              className="inline-flex icon"
              src={mailIcon}
              alt="external link"
            />
            Account Search
          </NavLink>
        </li>
        <li>
          <NavLink exact to="/site-status">
            <img
              className="inline-flex icon"
              src={statusIcon}
              alt="external link"
            />
            Site Status
          </NavLink>
        </li>
        <li>
          <NavLink exact to="/admin-logs">
            <img
              className="inline-flex icon"
              src={logsIcon}
              alt="external link"
            />
            Admin Logs
          </NavLink>
        </li>
      </ul>
    </div>
  </nav>
);

export default Nav;
