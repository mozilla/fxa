/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from "react";

type LinkExternalProps = {
  className?: string;
  href: string;
  children: React.ReactNode;
};

export const LinkExternal = ({
  className,
  href,
  children
}: LinkExternalProps) => (
  <a target="_blank" rel="noopener noreferrer" {...{ className }} {...{ href }}>
    {children}
  </a>
);

export default LinkExternal;
