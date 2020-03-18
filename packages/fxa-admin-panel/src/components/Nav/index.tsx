/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { NavLink } from 'react-router-dom';
import './index.scss';

export const Nav = () => (
  <nav>
    <div className="nav-container">
      <h2>Navigation</h2>
      <ul>
        <li>
          <NavLink exact to="/email-blocks">
            <img
              className="inline-flex icon"
              src={require('../../images/icon-mail.svg')}
              alt="external link"
            />
            Email blocks
          </NavLink>
        </li>
      </ul>
    </div>
  </nav>
);

export default Nav;
