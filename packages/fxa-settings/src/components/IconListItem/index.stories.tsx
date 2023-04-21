/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { withLocalization } from '../../../.storybook/decorators';
import {
  IconListItem,
  FolderIconListItem,
  GlobeIconListItem,
  KeyIconListItem,
  LockIconListItem,
  PrinterIconListItem,
  ShieldIconListItem,
} from '.';
import AppLayout from '../AppLayout';

export default {
  title: 'Components/IconListItem',
  component: IconListItem,
  subcomponents: { KeyIconListItem, ShieldIconListItem },
  decorators: [withLocalization],
} as Meta;

export const ListItemsOnly = () => (
  <>
    <FolderIconListItem>With folder icon</FolderIconListItem>
    <GlobeIconListItem>With globe icon</GlobeIconListItem>
    <KeyIconListItem>With key icon</KeyIconListItem>
    <LockIconListItem>With lock icon</LockIconListItem>
    <PrinterIconListItem>With printer icon</PrinterIconListItem>
    <ShieldIconListItem>With shield icon</ShieldIconListItem>
  </>
);

export const WithAppLayout = () => (
  <AppLayout>
    <KeyIconListItem>
      Lorem ipsum dolor, sit amet consectetur adipisicing elit. In hic dolore
      ipsum non impedit ab maiores, aspernatur autem molestiae recusandae!
    </KeyIconListItem>
    <ShieldIconListItem>
      Lorem ipsum dolor, sit amet consectetur adipisicing elit. In hic dolore
      ipsum non impedit ab maiores, aspernatur autem molestiae recusandae!
    </ShieldIconListItem>
  </AppLayout>
);
