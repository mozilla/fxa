/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { FunctionComponent, SVGProps } from 'react';
import { ReactComponent as TrashIcon } from './trash-icon.svg';
import { ReactComponent as RefreshIcon } from './refresh-icon.svg';

type ButtonIconProps = {
  title: string;
  icon: [FunctionComponent<SVGProps<SVGSVGElement>>, number, number];
  classNames?: string;
  disabled?: boolean;
  onClick?: () => void;
  testId?: string;
};

const ButtonIcon = ({
  title,
  icon,
  classNames,
  disabled,
  onClick,
  testId,
}: ButtonIconProps) => {
  const Icon = icon[0];

  return (
    <button
      className={`relative w-8 h-8 disabled:text-grey-300 disabled:cursor-wait ${classNames}`}
      data-testid={testId}
      {...{ title, onClick, disabled }}
    >
      <Icon
        width={icon[1]}
        height={icon[2]}
        className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 fill-current"
      />
    </button>
  );
};

export const ButtonIconTrash = ({
  classNames,
  disabled,
  onClick,
  testId,
  title,
}: Omit<ButtonIconProps, 'icon'>) => (
  <ButtonIcon
    classNames={`text-red-500 active:text-red-800 focus:text-red-800 ${classNames}`}
    icon={[TrashIcon, 11, 14]}
    {...{ title, disabled, onClick, testId }}
  />
);

export const ButtonIconReload = ({
  classNames,
  disabled,
  onClick,
  testId,
  title,
}: Omit<ButtonIconProps, 'icon'>) => (
  <ButtonIcon
    classNames={`text-grey-500 active:text-grey-600 focus:text-grey-600 ${classNames}`}
    icon={[RefreshIcon, 13, 12]}
    {...{ title, disabled, onClick, testId }}
  />
);

export default ButtonIcon;
