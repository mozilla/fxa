/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import TextInput from './index';

storiesOf('Components|TextInput', module)
  .add('type text (default)', () => (
    <div className="p-10 max-w-lg">
      <div className="mb-3">
        <TextInput
          label="Default label (with error tooltip)"
          placeholder="Here's a suggestion"
          errorText="This is some error text"
        />
      </div>
      <div className="mb-3">
        <TextInput label="Default label" placeholder="Here's a suggestion" />
      </div>
      <div className="mb-3">
        <TextInput
          label="Label with value"
          placeholder="Here's a suggestion"
          defaultValue="This is the value"
        />
      </div>
      <div className="mb-3">
        <TextInput label="This one's disabled" disabled />
      </div>
      <div className="mb-3">
        <TextInput
          label="This one's disabled"
          defaultValue="But it has a value"
          disabled
        />
      </div>
      <div className="mb-3">
        <TextInput
          label="Label that is extremely long because you never know what some languages are going to produce with the sentence you give them"
          placeholder="Hope it works!"
          defaultValue="wow"
        />
      </div>
    </div>
  ))
  .add('type email', () => (
    <div className="p-10 max-w-lg">
      <TextInput
        type="email"
        label="Enter your email, please"
        placeholder="cutie@pie.com"
      />
    </div>
  ))
  .add('type number', () => (
    <div className="p-10 max-w-lg">
      <TextInput
        type="number"
        label="How many stars in the universe?"
        placeholder="Just one, it's you"
      />
    </div>
  ))
  .add('type password', () => (
    <div className="p-10 max-w-lg">
      <TextInput
        type="password"
        label="Super secret password"
        placeholder="Make sure it's a good one"
      />
      <small className="block mt-2">
        Note: please use the <code>&lt;PasswordInput /&gt;</code> component
        instead.
      </small>
    </div>
  ))
  .add('type tel', () => (
    <div className="p-10 max-w-lg">
      <TextInput
        type="tel"
        label="Enter your phone number"
        defaultValue="250 746 4399"
      />
    </div>
  ))
  .add('type url', () => (
    <div className="p-10 max-w-lg">
      <TextInput type="url" label="Link to your alt account" />
    </div>
  ));
