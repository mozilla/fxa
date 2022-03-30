/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { NavLink } from 'react-router-dom';
import mailIcon from '../../images/icon-mail.svg';
import statusIcon from '../../images/icon-site-status.svg';
import logsIcon from '../../images/icon-logs.svg';

export const Nav = () => (
  <nav className="mb-4 desktop:mr-5 desktop:flex-1 desktop:mb-0">
    <div className="p-4 rounded-md bg-white border border-grey-100">
      <h2 className="mb-3 uppercase text-sm tracking-wide font-normal text-grey-500">
        Navigation
      </h2>
      <ul className="list-none p-0 m-0 text-sm">
        <li>
          <NavLink
            to="/account-search"
            className={({ isActive }) =>
              `rounded text-grey-600 flex mt-2 px-3 py-2 no-underline hover:bg-grey-100 focus:bg-grey-100 ${
                isActive ? 'bg-grey-50 font-semibold' : 'bg-grey-10'
              }`
            }
          >
            <img
              className="inline-flex mr-2 w-4"
              src={mailIcon}
              alt="mail icon"
            />
            Account Search
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/site-status"
            className={({ isActive }) =>
              `rounded text-grey-600 flex mt-2 px-3 py-2 no-underline hover:bg-grey-100 focus:bg-grey-100 ${
                isActive ? 'bg-grey-50 font-semibold' : 'bg-grey-10'
              }`
            }
          >
            <img
              className="inline-flex mr-2 w-4"
              src={statusIcon}
              alt="status icon"
            />
            Site Status
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/admin-logs"
            className={({ isActive }) =>
              `rounded text-grey-600 flex mt-2 px-3 py-2 no-underline hover:bg-grey-100 focus:bg-grey-100 ${
                isActive ? 'bg-grey-50 font-semibold' : 'bg-grey-10'
              }`
            }
          >
            <img
              className="inline-flex mr-2 w-4"
              src={logsIcon}
              alt="logs icon"
            />
            Admin Logs
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/permissions"
            className={({ isActive }) =>
              `rounded text-grey-600 flex mt-2 px-3 py-2 no-underline hover:bg-grey-100 focus:bg-grey-100 ${
                isActive ? 'bg-grey-50 font-semibold' : 'bg-grey-10'
              }`
            }
          >
            <img
              className="inline-flex mr-2 w-4"
              src={logsIcon}
              alt="logs icon"
            />
            Your Permissions
          </NavLink>
        </li>
      </ul>
    </div>
  </nav>
);

export default Nav;
