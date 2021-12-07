/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import LinkExternal from 'fxa-react/components/LinkExternal';
import iconExternalLink from '../../images/icon-external-link.svg';

export const LinkAbout = () => (
  <LinkExternal
    className="inline-flex align-self-center font-semibold text-white text-shadow-md hover:opacity-75 focus:opacity-75"
    href="https://github.com/mozilla/fxa/blob/main/packages/fxa-admin-panel/README.md"
  >
    <span className="pr-2">About</span>{' '}
    <img
      className="inline-flex w-5 h-auto"
      src={iconExternalLink}
      alt="external icon"
    />
  </LinkExternal>
);

export default LinkAbout;
