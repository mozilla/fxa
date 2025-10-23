/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { initializeRTL } from 'storybook-addon-rtl';
import '../src/styles/tailwind.out.css';
import './design-guide/design-guide.css';

initializeRTL();

export const parameters = {
  options: {
    storySort: {
      method: 'alphabetical',
    },
  },
};
