/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import LinkExternal from '../LinkExternal';
import './index.scss';

export const LinkAbout = () => (
  <LinkExternal
    className="about-link inline-flex align-self-center"
    href="https://github.com/mozilla/fxa/blob/master/packages/fxa-admin-panel/README.md"
  >
    <span>About</span>{' '}
    <img
      className="inline-flex icon"
      src={require('../../images/icon-external-link.svg')}
      alt="external link"
    />
  </LinkExternal>
);

export default LinkAbout;
