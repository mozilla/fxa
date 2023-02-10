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
  MOCK_SUBHEADING,
} from './mocks';
import { MozServices } from '../../lib/types';

export default {
  title: 'components/CardHeader',
  component: CardHeader,
} as Meta;

const storyWithProps = (
  props: React.ComponentProps<typeof CardHeader>,
  storyName?: string
) => {
  const story = () => (
    <AppLayout>
      <CardHeader {...props} />
    </AppLayout>
  );
  if (storyName) story.storyName = storyName;
  return story;
};

export const Basic = storyWithProps(
  {
    headingTextFtlId: MOCK_DEFAULT_HEADING_FTL_ID,
    headingText: MOCK_HEADING,
  },
  'Heading only (basic)'
);

export const BasicWithCustomSubheading = storyWithProps({
  headingAndSubheadingFtlId: MOCK_DEFAULT_HEADING_FTL_ID,
  headingText: MOCK_HEADING,
  subheadingText: MOCK_SUBHEADING,
});

export const BasicWithDefaultSubheading = storyWithProps({
  headingAndSubheadingFtlId: MOCK_CUSTOM_HEADING_FTL_ID,
  headingText: "Do somethin'",
});

export const WithDefaultServiceName = storyWithProps({
  headingWithDefaultServiceFtlId: MOCK_DEFAULT_HEADING_FTL_ID,
  headingText: MOCK_HEADING,
});

export const WithCustomServiceName = storyWithProps({
  serviceName: MOCK_SERVICE_NAME,
  headingWithCustomServiceFtlId: MOCK_CUSTOM_HEADING_FTL_ID,
  headingText: MOCK_HEADING,
});

export const WithSeparateSubheadingDefaultServiceName = storyWithProps(
  {
    headingText: MOCK_HEADING,
    headingTextFtlId: MOCK_DEFAULT_HEADING_FTL_ID,
    subheadingWithDefaultServiceFtlId: MOCK_DEFAULT_HEADING_FTL_ID,
    subheadingWithLogoFtlId: MOCK_DEFAULT_HEADING_FTL_ID,
  },
  'Separate l10n for subheading, with default service'
);

export const WithSeparateSubheadingCustomServiceName = storyWithProps(
  {
    serviceName: MOCK_SERVICE_NAME,
    headingText: MOCK_HEADING,
    headingTextFtlId: MOCK_DEFAULT_HEADING_FTL_ID,
    subheadingWithCustomServiceFtlId: MOCK_CUSTOM_HEADING_FTL_ID,
    subheadingWithLogoFtlId: MOCK_CUSTOM_HEADING_FTL_ID,
  },
  'Separate l10n for subheading, with custom service name'
);

export const WithSeparateSubheadingLogo = storyWithProps(
  {
    serviceName: MozServices.Pocket,
    headingText: MOCK_HEADING,
    headingTextFtlId: MOCK_DEFAULT_HEADING_FTL_ID,
    subheadingWithCustomServiceFtlId: MOCK_CUSTOM_HEADING_FTL_ID,
    subheadingWithLogoFtlId: MOCK_DEFAULT_HEADING_FTL_ID,
  },
  'Separate l10n for subheading, with logo'
);
