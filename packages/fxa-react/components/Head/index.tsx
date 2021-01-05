/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Helmet } from 'react-helmet';

const Head = ({ title }: { title?: string }) => (
  <Helmet>
    <title>{title ? `${title} | Firefox Accounts` : 'Firefox Accounts'}</title>
  </Helmet>
);

export default Head;
