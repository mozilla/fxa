/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import GetDataTrio from './index';

storiesOf('Components|GetDataTrio', module).add('default', () => (
  <div className="p-10 max-w-xs">
    <GetDataTrio value="Copy that" url="https://mozilla.org" />
  </div>
));
