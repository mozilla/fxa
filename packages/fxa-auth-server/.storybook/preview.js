/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import '../lib/senders/emails/storybook.css';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
};

export const globalTypes = {
  direction: {
    name: 'Text directionality',
    description: 'Set text to LTR or RTL direction',
    defaultValue: 'ltr',
    toolbar: {
      icon: 'transfer',
      items: [
        {
          value: 'ltr',
          right: '➡️',
          title: 'Left to Right',
        },
        {
          value: 'rtl',
          right: '⬅️',
          title: 'Right to Left',
        },
      ],
    },
  },
};
