/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ComponentProps } from 'react';
import AppLayout from '.';

type StoryAppLayoutProps = Omit<ComponentProps<typeof AppLayout>, 'title'> & {
  title?: string;
};

/** `AppLayout` for component stories, where the page title doesn't matter. */
const StoryAppLayout = ({
  title = 'Storybook',
  ...props
}: StoryAppLayoutProps) => <AppLayout title={title} {...props} />;

export default StoryAppLayout;
