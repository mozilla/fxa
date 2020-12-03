/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import './index.scss';

export const SiteStatus = () => {
  return (
    <div className="site-status">
      <h2>Site Status</h2>
      <p>
        This is a read-only page that prints all the current environment
        variables.
      </p>
      <br />
      <hr />
      <br />
      <h3>Redis Environment Variables</h3>
      <p className="gradient-info-display">Coming soon</p>
    </div>
  );
};

export default SiteStatus;
