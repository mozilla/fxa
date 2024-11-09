/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { LocationProvider } from '@reach/router';
import { UnitRow } from '.';
import {
  MOCK_CHILD_ELEM,
  MOCK_CTA_TEXT,
  MOCK_HEADER,
  MOCK_HEADER_VALUE,
  SubjectWithCustomAvatar,
  SubjectWithDefaultAvatar,
  SubjectWithModal,
  SubjectWithSecondaryModal,
} from './mocks';
import { ButtonIconReload } from '../ButtonIcon';

export default {
  title: 'Components/Settings/UnitRow',
  component: UnitRow,
  decorators: [
    withLocalization,
    (Story: StoryObj) => (
      <LocationProvider>
        <Story />
      </LocationProvider>
    ),
  ],
} as Meta;

export const NoHeaderValueAndNoCTA = () => <UnitRow header={MOCK_HEADER} />;
export const NoHeaderValueAndNoCTAHideHeader = () => (
  <UnitRow header={MOCK_HEADER} hideHeaderValue />
);

export const NoHeaderValueWithDefaultCTA = () => (
  <UnitRow header={MOCK_HEADER} route="#" />
);

export const NoHeaderValueWithCustomCTA = () => (
  <UnitRow header={MOCK_HEADER} ctaText={MOCK_CTA_TEXT} route="#" />
);

export const NoHeaderValueWithCustomCTAAndReloadButton = () => (
  <UnitRow
    header={MOCK_HEADER}
    route="#"
    ctaText={MOCK_CTA_TEXT}
    actionContent={<ButtonIconReload title="Retry" />}
  />
);

export const NoHeaderValueWithModalTriggeringCTA = () => <SubjectWithModal />;

export const WithHeaderValueAndDefaultCTA = () => (
  <UnitRow header={MOCK_HEADER} headerValue={MOCK_HEADER_VALUE} route="#" />
);

export const WithHeaderValueAndChildren = () => (
  <UnitRow header={MOCK_HEADER} headerValue={MOCK_HEADER_VALUE} route="#">
    {MOCK_CHILD_ELEM}
  </UnitRow>
);

export const HeaderValueWithModalTriggeringSecondaryCTA = () => (
  <SubjectWithSecondaryModal />
);

export const WithDefaultAvatar = () => <SubjectWithDefaultAvatar />;

export const WithCustomAvatar = () => <SubjectWithCustomAvatar />;
