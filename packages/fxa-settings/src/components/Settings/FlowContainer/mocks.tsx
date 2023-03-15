/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';

export const MOCK_TITLE = 'Flow container title';

export const MOCK_SUBTITLE = 'Subtitle';

export const MOCK_CONTENT = (
  <div className="flex flex-col my-4 gap-4">
    <p className="text-sm">
      All the container content is passed in as children except the title and
      subtitle.
    </p>
    <button className="cta-primary cta-xl">This button does nothing</button>
  </div>
);
