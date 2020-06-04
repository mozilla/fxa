/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';

type LinkExternalProps = {
  className?: string;
  href: string;
  children: React.ReactNode;
  title?: string;
  'data-testid'?: string;
};

export const LinkExternal = ({
  className,
  href,
  children,
  title,
  'data-testid': testid = 'link-external',
}: LinkExternalProps) => (
  <a
    data-testid={testid}
    target="_blank"
    rel="noopener noreferrer"
    {...{
      className,
      href,
      title,
    }}
  >
    {children}
    <span className="sr-only">Opens in new window</span>
  </a>
);

export default LinkExternal;
