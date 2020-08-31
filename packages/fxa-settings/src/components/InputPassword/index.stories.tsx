/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import InputPassword from '.';

storiesOf('Components|InputPassword', module).add('default', () => (
  <div className="p-10 max-w-lg">
    <InputPassword label="You think you know how to password? Enter it here." />
  </div>
));
