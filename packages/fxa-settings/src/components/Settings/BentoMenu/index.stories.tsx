/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect } from 'react';
import BentoMenu from '.';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';

export default {
  title: 'Components/Settings/BentoMenu',
  component: BentoMenu,
  decorators: [withLocalization],
} as Meta;

export const Basic = () => (
  <div className="w-full flex justify-end">
    <div className="flex tablet:pr-10 pt-4">
      <BentoMenu />
    </div>
  </div>
);

export const MenuOpen = () => {
  useEffect(() => {
    (
      document.querySelector(
        '[data-testid="drop-down-bento-menu-toggle"]'
      ) as HTMLButtonElement
    )?.click();
  }, []);

  return (
    <div className="w-full flex justify-end">
      <div className="flex tablet:pr-10 pt-4">
        <BentoMenu />
      </div>
    </div>
  );
};
