/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import SubRow, { BackupCodesSubRow, BackupPhoneSubRow } from './index';
import { action } from '@storybook/addon-actions';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { CodeIcon } from '../../Icons';

export default {
  title: 'Components/Settings/SubRow',
  component: SubRow,
  decorators: [
    withLocalization,
    (Story) => {
      return (
        // @container/unitRow on the container div allows sub row to adjust based on the size of the parent container
        // instead of the viewport. This fixes issues with the subrow and CTAs overflowing their parent container in mobileLandscape
        // and tablet portrait views.
        <div className="@container/unitRow">
          <Story />
        </div>
      );
    },
  ],
} as Meta;

export const GenericSubRow: StoryFn = () => (
  <SubRow
    ctaGleanId="glean_id"
    ctaMessage="CTA text"
    icon={<CodeIcon className="my-0" />}
    idPrefix="example"
    isEnabled
    localizedInfoMessage="Row description"
    localizedRowTitle="Sub row title"
    message={<div>Status message goes here</div>}
    onCtaClick={action('Add clicked')}
  />
);

export const GenericSubRowWithDescription: StoryFn = () => (
  <SubRow
    ctaGleanId="glean_id"
    ctaMessage="CTA text"
    icon={<CodeIcon className="my-0" />}
    idPrefix="example"
    isEnabled
    localizedInfoMessage="Row description"
    localizedRowTitle="Sub row title"
    message={<div>Status message goes here</div>}
    onCtaClick={action('CTA clicked')}
  />
);

export const BackupCodesAvailable: StoryFn = () => (
  <BackupCodesSubRow
    numCodesAvailable={5}
    onCtaClick={action('Get new codes clicked')}
  />
);

export const BackupCodesUnavailable: StoryFn = () => (
  <BackupCodesSubRow numCodesAvailable={0} onCtaClick={action('Add clicked')} />
);

export const BackupPhoneUnavailable: StoryFn = () => (
  <BackupPhoneSubRow onCtaClick={action('Add recovery phone clicked')} />
);

export const BackupPhoneUnavailableWithDescription: StoryFn = () => (
  <BackupPhoneSubRow
    onCtaClick={action('Add recovery phone clicked')}
    showDescription
  />
);

export const BackupPhoneAvailable: StoryFn = () => (
  <BackupPhoneSubRow
    onCtaClick={action('Change recovery phone')}
    phoneNumber="555-555-1234"
  />
);

export const BackupPhoneAvailableWithDescription: StoryFn = () => (
  <BackupPhoneSubRow
    onCtaClick={action('Change recovery phone')}
    phoneNumber="555-555-1234"
    showDescription
  />
);

export const BackupPhoneAvailableWithDelete: StoryFn = () => (
  <BackupPhoneSubRow
    onCtaClick={action('Change recovery phone')}
    onDeleteClick={action('Delete recovery phone')}
    phoneNumber="555-555-1234"
  />
);

export const BackupPhoneAvailableWithDeleteAndDescription: StoryFn = () => (
  <BackupPhoneSubRow
    onCtaClick={action('Change recovery phone')}
    onDeleteClick={action('Delete recovery phone')}
    phoneNumber="555-555-1234"
    showDescription
  />
);

export const BackupPhoneAvailableNoDelete: StoryFn = () => (
  <BackupPhoneSubRow
    onCtaClick={action('Change recovery phone')}
    phoneNumber="555-555-1234"
  />
);
