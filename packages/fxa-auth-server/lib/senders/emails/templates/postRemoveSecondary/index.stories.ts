/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Story, Meta } from '@storybook/html';
import storybookEmail, {
  StorybookEmailArgs,
  commonArgs,
} from '../../storybook-email';

export default {
  title: 'Emails/postRemoveSecondary',
} as Meta;

const Template: Story<StorybookEmailArgs> = (args) => storybookEmail(args);

const defaultVariables = {
  ...commonArgs,
  action: 'Manage account',
  link: 'http://localhost:3030/settings',
  subject: 'Secondary email removed',
  secondaryEmail: 'secondary@email',
};

const commonPropsWithOverrides = (
  overrides: Partial<typeof defaultVariables> = {}
) =>
  Object.assign({
    template: 'postRemoveSecondary',
    layout: 'fxa',
    doc: 'Post Remove Secondary email is sent when user removes the secondary-email associated with his account',
    variables: {
      ...defaultVariables,
      ...overrides,
    },
  });

export const PostRemoveSecondary = Template.bind({});
PostRemoveSecondary.args = commonPropsWithOverrides();
