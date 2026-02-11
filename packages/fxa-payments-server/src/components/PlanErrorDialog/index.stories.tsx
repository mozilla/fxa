/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { PlanErrorDialog } from './index';
import { APIError } from '../../lib/apiClient';
import { PLANS } from '../../lib/mock-data';
import { FetchState, Plan } from '../../store/types';
import { Meta } from '@storybook/react';
import AppLocalizationProvider from 'fxa-react/lib/AppLocalizationProvider';

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

const storyWithProps = (plans: FetchState<Plan[], any>, storyName?: string) => {
  const story = () => (
    <AppLocalizationProvider
      baseDir="./locales"
      userLocales={navigator.languages}
    >
      <PlanErrorDialog locationReload={locationReload} plans={plans} />
    </AppLocalizationProvider>
  );

  if (storyName) story.storyName = storyName;
  return story;
};

export const Default = storyWithProps(plans, 'no plan for product');
export const ProblemLoadingPlans = storyWithProps(
  { ...plans, result: null },
  'problem loading plans'
);
export const LocationNotSupported = storyWithProps(
  {
    error: new APIError({
      statusCode: 400,
      errno: 213,
      message: 'Location not supported',
    }),
    loading: false,
    result: null,
  },
  'location not supported'
);
