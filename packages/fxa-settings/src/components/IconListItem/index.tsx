/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { ReactComponent as IconFolder } from './icon-folder.svg';
import { ReactComponent as IconGlobe } from './icon-globe.svg';
import { ReactComponent as IconKey } from './icon-key.svg';
import { ReactComponent as IconLock } from './icon-lock.svg';
import { ReactComponent as IconPrinter } from './icon-printer.svg';
import { ReactComponent as IconShield } from './icon-shield.svg';
import { ReactElement } from 'react-markdown/lib/react-markdown';

interface IconListItemProps {
  icon: ReactElement;
  children: string | ReactElement;
}

export const IconListItem = ({ icon, children }: IconListItemProps) => {
  return (
    <li className="flex gap-2 items-start text-xs my-2">
      <span
        className="ltr:mr-1 rtl:ml-1 text-grey-400"
        aria-hidden="true"
        role="img"
        data-testid="list-item-icon"
      >
        {icon}
      </span>
      <span className="flex flex-col gap-4 text-start">{children}</span>
    </li>
  );
};

export const FolderIconListItem = ({
  children,
}: Omit<IconListItemProps, 'icon'>) => {
  return (
    <IconListItem
      icon={<IconFolder className="w-5 h-5 items-center justify-center" />}
    >
      {children}
    </IconListItem>
  );
};

export const GlobeIconListItem = ({
  children,
}: Omit<IconListItemProps, 'icon'>) => {
  return (
    <IconListItem
      icon={<IconGlobe className="w-5 h-5 items-center justify-center" />}
    >
      {children}
    </IconListItem>
  );
};

export const KeyIconListItem = ({
  children,
}: Omit<IconListItemProps, 'icon'>) => {
  return (
    <IconListItem
      icon={<IconKey className="w-5 h-5 items-center justify-center" />}
    >
      {children}
    </IconListItem>
  );
};

export const LockIconListItem = ({
  children,
}: Omit<IconListItemProps, 'icon'>) => {
  return (
    <IconListItem
      icon={<IconLock className="w-5 h-5 items-center justify-center" />}
    >
      {children}
    </IconListItem>
  );
};

export const PrinterIconListItem = ({
  children,
}: Omit<IconListItemProps, 'icon'>) => {
  return (
    <IconListItem
      icon={<IconPrinter className="w-5 h-5 items-center justify-center" />}
    >
      {children}
    </IconListItem>
  );
};

export const ShieldIconListItem = ({
  children,
}: Omit<IconListItemProps, 'icon'>) => {
  return (
    <IconListItem
      icon={<IconShield className="w-5 h-5 items-center justify-center" />}
    >
      {children}
    </IconListItem>
  );
};
