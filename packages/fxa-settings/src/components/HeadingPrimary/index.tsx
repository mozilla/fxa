/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';

export const HeadingPrimary = ({
  children,
  marginClass = 'mb-5',
}: {
  children: React.ReactNode;
  marginClass?: string;
}) => <h1 className={`${marginClass} text-grey-400 text-base`}>{children}</h1>;
