/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { ButtonIconTrash, ButtonIconReload } from '.';

storiesOf('Components|ButtonIcon', module)
  .add('ButtonIconTrash', () => (
    <div className="p-10 max-w-lg">
      <ButtonIconTrash title="Remove email" />
    </div>
  ))
  .add('ButtonIconReload', () => (
    <div className="p-10 max-w-lg">
      <ButtonIconReload title="Reload email" />
    </div>
  ));
