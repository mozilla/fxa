/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ReactComponent as IconFolderLegacy } from './icon-folder.svg';
import { ReactComponent as IconGlobeLegacy } from './icon-globe.svg';
import { ReactComponent as IconKeyLegacy } from './icon-key.svg';
import { ReactComponent as IconLockLegacy } from './icon-lock.svg';
import { ReactComponent as IconPrinterLegacy } from './icon-printer.svg';
import { ReactComponent as IconShieldLegacy } from './icon-shield.svg';
import { ReactElement } from 'react';
import { ReactComponent as Folder } from '../Icons/nova/folder.min.svg';
import { ReactComponent as Globe } from '../Icons/nova/globe.min.svg';
import { ReactComponent as Passkey } from '../Icons/nova/passkey.min.svg';
import { ReactComponent as Lock } from '../Icons/nova/lock.min.svg';
import { ReactComponent as Print } from '../Icons/nova/print.min.svg';
import { ReactComponent as Shield } from '../Icons/nova/shield.min.svg';
import { withNova } from '../../lib/nova';

const IconFolder = withNova(IconFolderLegacy, Folder);
const IconGlobe = withNova(IconGlobeLegacy, Globe);
const IconKey = withNova(IconKeyLegacy, Passkey);
const IconLock = withNova(IconLockLegacy, Lock);
const IconPrinter = withNova(IconPrinterLegacy, Print);
const IconShield = withNova(IconShieldLegacy, Shield);

interface IconListItemProps {
  icon: ReactElement;
  listItemClassnames?: string;
  spanClassNames?: string;
  children: string | ReactElement;
}

export const IconListItem = ({
  icon,
  listItemClassnames,
  spanClassNames = 'me-1 text-deemphasized',
  children,
}: IconListItemProps) => {
  return (
    <li className={`flex gap-2 items-start my-2 ${listItemClassnames}`}>
      <span
        className={spanClassNames}
        aria-hidden="true"
        data-testid="list-item-icon"
      >
        {icon}
      </span>
      <span className="flex flex-col gap-4">{children}</span>
    </li>
  );
};

export const FolderIconListItem = ({
  listItemClassnames,
  children,
}: Omit<IconListItemProps, 'icon'>) => {
  return (
    <IconListItem
      spanClassNames="text-grey-600 dark:text-grey-200 nova:text-deemphasized"
      icon={<IconFolder className="w-4 h-4 items-center justify-center" />}
      {...{ listItemClassnames }}
    >
      {children}
    </IconListItem>
  );
};

export const GlobeIconListItem = ({
  listItemClassnames,
  children,
}: Omit<IconListItemProps, 'icon'>) => {
  return (
    <IconListItem
      {...{ listItemClassnames }}
      spanClassNames="text-grey-600 dark:text-grey-200 nova:text-deemphasized"
      icon={<IconGlobe className="w-4 h-4 items-center justify-center" />}
    >
      {children}
    </IconListItem>
  );
};

export const KeyIconListItem = ({
  listItemClassnames,
  children,
}: Omit<IconListItemProps, 'icon'>) => {
  return (
    <IconListItem
      icon={<IconKey className="w-5 h-5 items-center justify-center" />}
      {...{ listItemClassnames }}
    >
      {children}
    </IconListItem>
  );
};

export const LockIconListItem = ({
  listItemClassnames,
  children,
}: Omit<IconListItemProps, 'icon'>) => {
  return (
    <IconListItem
      spanClassNames="text-grey-600 dark:text-grey-200 nova:text-deemphasized"
      icon={<IconLock className="w-4 h-4 items-center justify-center" />}
      {...{ listItemClassnames }}
    >
      {children}
    </IconListItem>
  );
};

export const PrinterIconListItem = ({
  listItemClassnames,
  children,
}: Omit<IconListItemProps, 'icon'>) => {
  return (
    <IconListItem
      spanClassNames="text-grey-600 dark:text-grey-200 nova:text-deemphasized"
      icon={<IconPrinter className="w-4 h-4 items-center justify-center" />}
      {...{ listItemClassnames }}
    >
      {children}
    </IconListItem>
  );
};

export const ShieldIconListItem = ({
  listItemClassnames,
  children,
}: Omit<IconListItemProps, 'icon'>) => {
  return (
    <IconListItem
      icon={
        <IconShield className="w-5 h-5 translate-y-0.5 px-[1.75px] items-center justify-center" />
      }
      {...{ listItemClassnames }}
    >
      {children}
    </IconListItem>
  );
};
