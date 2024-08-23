/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Localized } from '@fluent/react';

type LinkExternalProps = {
  className?: string;
  href: string;
  children: React.ReactNode;
  title?: string;
  'data-testid'?: string;
  gleanDataAttrs?: {
    id: string;
    type?: string;
  };
  rel?: 'noopener noreferrer' | 'author';
  tabIndex?: number;
  onClick?: () => void;
};

export const LinkExternal = ({
  className,
  href,
  children,
  title,
  'data-testid': testid = 'link-external',
  rel = 'noopener noreferrer',
  gleanDataAttrs,
  tabIndex,
  onClick,
}: LinkExternalProps) => (
  <a
    data-testid={testid}
    data-glean-id={gleanDataAttrs?.id}
    data-glean-type={gleanDataAttrs?.type}
    target="_blank"
    {...{
      className,
      href,
      title,
      rel,
      tabIndex,
      onClick,
    }}
  >
    {children}
    <Localized id="link-sr-new-window">
      <span className="sr-only">Opens in new window</span>
    </Localized>
  </a>
);

export default LinkExternal;
