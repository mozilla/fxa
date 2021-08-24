/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { forceReRender } from '@storybook/html';

let socket = new WebSocket('ws://0.0.0.0:8193');
socket.onmessage = function (event) {
  if (event.data === 'file-change') {
    console.log('File changed, reloading...');
    forceReRender();
  }
};

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

const withTextDirectionality = (Story, context) => {
  const container = document.createElement('div');
  container.classList.add(context.globals.direction);
  container.appendChild(Story(context));
  return container;
};

export const decorators = [withTextDirectionality];
