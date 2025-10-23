/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import ButtonBack from '.';
import { RelierCmsInfo } from '../../models/integrations';
import { MOCK_CMS_INFO } from '../../pages/mocks';
import AppLayout from '../AppLayout';
import { HeadingPrimary } from '../HeadingPrimary';

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

export const Default = () => (
  <Subject description="Default background - default arrow" />
);

export const LightBackgroundDefaultArrow = () => (
  <Subject
    cmsBackground="linear-gradient(135deg, rgba(240, 255, 250, 1) 0%, rgba(250, 245, 240, 1) 100%)"
    description="Light background - default arrow"
  />
);

export const MediumBackgroundWhiteArrow = () => (
  <Subject
    cmsBackground={MOCK_CMS_INFO.shared.backgrounds.defaultLayout}
    description="Light-medium gradient background - white arrow"
  />
);

export const DarkBackgroundWhiteArrow = () => (
  <Subject
    cmsBackground="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    description="Dark gradient background - white arrow"
  />
);

export const MediumBackgroundDarkArrow = () => (
  <Subject
    cmsBackground="linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)"
    description="Medium gradient background - dark grey arrow"
  />
);
