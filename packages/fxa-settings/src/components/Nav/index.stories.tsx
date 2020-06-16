/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { Nav } from '.';

storiesOf('Components|Nav', module)
  .add('basic', () => (
    <Nav hasSubscription={false} primaryEmail="user@xample.com" />
  ))
  .add('with link to Subscriptions', () => (
    <Nav hasSubscription primaryEmail="user@example.com" />
  ));
