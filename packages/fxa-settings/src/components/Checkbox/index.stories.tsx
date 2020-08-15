/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import Checkbox from './index';

storiesOf('Components|Checkbox', module).add('default', () => (
  <div className="p-10 max-w-lg">
    <div className="mb-3">
      <Checkbox />
    </div>
    <div className="mb-3">
      <Checkbox
        label="Howdy I'm a label"
        readerText="This is additional information that screen readers can describe"
      />
    </div>
    <div className="mb-3">
      <Checkbox label="Hey hey, I'm checked baby" defaultChecked />
    </div>
    <div className="mb-3">
      <Checkbox
        label="Label that is extremely long because you never know what some languages are going to produce with the sentence you give them"
        defaultChecked
      />
    </div>
    <div className="mb-3">
      <Checkbox label="Can't check this du nu nu nun" disabled />
    </div>
    <div className="mb-3">
      <Checkbox
        label="Checked and disabled? Cool flex."
        defaultChecked={true}
        disabled
      />
    </div>
  </div>
));
