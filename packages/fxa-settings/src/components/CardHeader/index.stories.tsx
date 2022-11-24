/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import CardHeader from '.';
import AppLayout from '../AppLayout';
import { Meta } from '@storybook/react';
import {
  MOCK_DEFAULT_HEADING_FTL_ID,
  MOCK_CUSTOM_HEADING_FTL_ID,
  MOCK_HEADING,
  MOCK_SERVICE_NAME,
} from './mocks';

export default {
  title: 'components/CardHeader',
  component: CardHeader,
} as Meta;

const storyWithProps = ({ ...props }) => {
  const story = () => (
    <AppLayout>
      <CardHeader
        {...props}
        headingWithDefaultServiceFtlId={MOCK_DEFAULT_HEADING_FTL_ID}
        headingText={MOCK_HEADING}
      />
    </AppLayout>
  );
  return story;
};

export const Default = storyWithProps({});

export const WithServiceName = storyWithProps({
  serviceName: MOCK_SERVICE_NAME,
  headingWithCustomServiceFtlId: MOCK_CUSTOM_HEADING_FTL_ID,
});
