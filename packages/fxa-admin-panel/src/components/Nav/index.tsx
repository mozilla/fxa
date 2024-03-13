/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { NavLink } from 'react-router-dom';
import accountIcon from '../../images/icon-account.svg';
import keyIcon from '../../images/icon-key.svg';
import logsIcon from '../../images/icon-logs.svg';
import { AdminPanelFeature } from 'fxa-shared/guards';
import Guard from '../Guard';

const getNavLinkClassName = (isActive: boolean) =>
  `rounded text-grey-900 flex mt-2 px-3 py-2 no-underline hover:bg-grey-100 focus:bg-grey-100 ${
    isActive ? 'bg-grey-50 font-semibold' : 'bg-grey-10'
  }`;

export const Nav = () => (
  <nav className="mb-4 desktop:mr-5 desktop:flex-1 desktop:mb-0">
    <div className="p-3 rounded-md bg-white border border-grey-100">
      <h2 className="mb-3 uppercase text-sm tracking-wide font-normal text-grey-500">
        Navigation
      </h2>
      <ul className="list-none p-0 m-0 text-sm">
        <Guard features={[AdminPanelFeature.AccountSearch]}>
          <li>
            <NavLink
              to="/account-search"
              className={({ isActive }) => getNavLinkClassName(isActive)}
            >
              <img
                className="inline-flex mr-2 w-4"
                src={accountIcon}
                alt="account icon"
              />
              Account Search
            </NavLink>
          </li>
        </Guard>
        <Guard features={[AdminPanelFeature.AccountDelete]}>
          <li>
            <NavLink
              to="/account-delete"
              className={({ isActive }) => getNavLinkClassName(isActive)}
            >
              <img
                className="inline-flex mr-2 w-4"
                src={accountIcon}
                alt="account icon"
              />
              Account Delete
            </NavLink>
          </li>
        </Guard>
        <Guard features={[AdminPanelFeature.RelyingParties]}>
          <li>
            <NavLink
              to="/relying-parties"
              className={({ isActive }) => getNavLinkClassName(isActive)}
            >
              <img
                className="inline-flex mr-2 w-4"
                src={keyIcon}
                alt="key icon"
              />
              Relying Parties
            </NavLink>
          </li>
        </Guard>
        <li>
          <NavLink
            to="/permissions"
            className={({ isActive }) => getNavLinkClassName(isActive)}
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
