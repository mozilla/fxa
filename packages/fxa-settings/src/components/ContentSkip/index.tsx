/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';

export const ContentSkip = () => (
  <a
    href="#main"
    data-testid="content-skip"
    className="sr-only focus:w-auto focus:h-auto focus:clip-auto absolute bg-white font-medium shadow-md px-3 py-2 z-10 rounded ml-2 mt-2 cursor-pointer"
  >
    Skip to content
  </a>
);

export default ContentSkip;
