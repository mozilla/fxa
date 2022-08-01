/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { PlanErrorDialog } from './index';
import { PLANS } from '../../lib/mock-data';
import { FetchState, Plan } from '../../store/types';
import { Meta } from '@storybook/react';

export default {
  title: 'components/PlanErrorDialog',
  component: PlanErrorDialog,
} as Meta;

const locationReload = () => {};
const plans: FetchState<Plan[], any> = {
  error: null,
  loading: false,
  result: PLANS,
};

const storyWithContext = (
  plans: FetchState<Plan[], any>,
  storyName?: string
) => {
  const story = () => (
    <PlanErrorDialog locationReload={locationReload} plans={plans} />
  );

  if (storyName) story.storyName = storyName;
  return story;
};

export const Default = storyWithContext(plans, 'no plan for product');

export const ProblemLoadingPlans = storyWithContext(
  { ...plans, result: null },
  'problem loading plans'
);
