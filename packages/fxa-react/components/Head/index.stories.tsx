/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import Head from './index';

storiesOf('Components/Head', module)
  .add('basic', () => <Head />)
  .add('with title', () => <Head title="neat feature" />);
