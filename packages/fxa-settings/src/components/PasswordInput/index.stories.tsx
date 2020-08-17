/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import PasswordInput from './index';

storiesOf('Components|PasswordInput', module).add('default', () => (
  <div className="p-10 max-w-lg">
    <div className="mb-3">
      <PasswordInput label="You think you know how to password? Enter it here." />
    </div>
  </div>
));
