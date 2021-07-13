/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { PlanErrorDialog } from './index';
import { PLANS } from '../../lib/mock-data';
import { FetchState, Plan } from '../../store/types';

const locationReload = () => {};
const plans: FetchState<Plan[], any> = {
  error: null,
  loading: false,
  result: PLANS,
};

storiesOf('components/PlanErrorDialog', module)
  .add('no plan for product', () => (
    <PlanErrorDialog locationReload={locationReload} plans={plans} />
  ))
  .add('problem loading plans', () => (
    <PlanErrorDialog
      locationReload={locationReload}
      plans={{ ...plans, result: null }}
    />
  ));
