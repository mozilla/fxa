/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import AppLayout from '../AppLayout';
import ButtonBack from '.';
import { HeadingPrimary } from '../HeadingPrimary';
import { RelierCmsInfo } from '../../models/integrations';

export default {
  title: 'components/ButtonBack',
  component: ButtonBack,
  decorators: [withLocalization],
} as Meta;

interface SubjectProps {
  cmsBackground?: string;
  description: string;
}

const Subject = ({ cmsBackground, description }: SubjectProps) => {
  const cmsInfo: RelierCmsInfo | undefined = cmsBackground
    ? ({
        shared: {
          backgrounds: {
            defaultLayout: cmsBackground,
          },
        },
      } as RelierCmsInfo)
    : undefined;

  return (
    <AppLayout {...{ cmsInfo }}>
      <div className="relative flex items-start p-8 min-h-[200px]">
        <ButtonBack {...{ cmsBackground }} />
        <HeadingPrimary>{description}</HeadingPrimary>
      </div>
    </AppLayout>
  );
};

export const LightBackgroundDefaultArrow = () => (
  <Subject description="Default background - default arrow" />
);

export const LightBackgroundDarkGreyArrow = () => (
  <Subject
    cmsBackground="linear-gradient(135deg, #c5e3fd 0%, #c9d6fa 100%)"
    description="Light-medium gradient background - dark grey arrow"
  />
);

export const MediumBackgroundBlackArrow = () => (
  <Subject
    cmsBackground="linear-gradient(135deg, #296615 0%, #209f40 100%)"
    description="Medium gradient background - default arrow"
  />
);

export const MediumBackgroundDarkGreyArrow = () => (
  <Subject
    cmsBackground="linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)"
    description="Medium gradient background - dark grey arrow"
  />
);

export const MediumBackgroundWhiteArrow = () => (
  <Subject
    cmsBackground="linear-gradient(135deg, #3e59ce 0%, #4f1f80 100%)"
    description="Medium gradient background - white arrow"
  />
);

export const DarkGradientBackgroundWhiteArrow = () => (
  <Subject
    cmsBackground="linear-gradient(135deg, #0c3521 0%, #231c4c 50%, #38243e 100%)"
    description="Very dark gradient background - white arrow"
  />
);

export const DarkSolidBackgroundWhiteArrow = () => (
  <Subject
    cmsBackground="#000000"
    description="Black background - default arrow"
  />
);
