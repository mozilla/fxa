/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';

type NavProps = {
  hasSubscription: boolean;
};

export const Nav = ({ hasSubscription }: NavProps) => (
  <nav className="mr-24 hidden desktop:block">
    <h2>Settings</h2>
  </nav>
);

export default Nav;
