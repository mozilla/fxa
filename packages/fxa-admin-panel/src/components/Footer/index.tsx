/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import LinkExternal from 'fxa-react/components/LinkExternal';
import './index.scss';

export const Footer = () => (
  <footer>
    <div className="container flex justify-flex-end">
      <LinkExternal href="https://www.mozilla.org/about/?utm_source=firefox-accounts&amp;utm_medium=Referral">
        <img src={require('../../images/moz-logo.svg')} alt="Mozilla logo" />
      </LinkExternal>
    </div>
  </footer>
);

export default Footer;
