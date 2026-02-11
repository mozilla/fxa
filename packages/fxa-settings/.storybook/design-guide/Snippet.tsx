/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';

const Snippet = ({ moarClasses = '', children }) => (
  <code className={`bg-grey-100 text-sm px-1 rounded-sm ${moarClasses}`}>
    {children}
  </code>
);

export default Snippet;
