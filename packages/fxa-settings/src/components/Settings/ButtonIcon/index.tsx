/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { FunctionComponent, SVGProps } from 'react';
import { ReactComponent as TrashIcon } from './minimal-trash-icon.svg';
import { ReactComponent as RefreshIcon } from './refresh-icon.svg';
import { GleanClickEventDataAttrs } from '../../../lib/types';

type ButtonIconProps = {
  title: string;
  icon: [
    FunctionComponent<SVGProps<SVGSVGElement & { title?: string }>>,
    number,
    number
  ];
  classNames?: string;
  disabled?: boolean;
  gleanDataAttrs?: GleanClickEventDataAttrs;
  onClick?: () => void;
  testId?: string;
};

export const ButtonIcon = ({
  title,
  icon,
  classNames,
  disabled,
  gleanDataAttrs,
  onClick,
  testId,
}: ButtonIconProps) => {
  const Icon = icon[0];

  return (
    <button
      className={`relative w-8 h-8 rounded disabled:text-grey-300  hover:bg-grey-50 active:bg-grey-100 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 focus:bg-grey-10 disabled:cursor-wait ${classNames}`}
      data-testid={testId}
      {...{
        'data-glean-id': gleanDataAttrs?.id,
        'data-glean-label': gleanDataAttrs?.label,
        'data-glean-type': gleanDataAttrs?.type,
      }}
      {...{ title, onClick, disabled }}
    >
      <Icon
        width={icon[1]}
        height={icon[2]}
        className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 fill-current"
        aria-label={title}
      />
    </button>
  );
};

export const ButtonIconTrash = ({
  classNames,
  disabled,
  gleanDataAttrs,
  onClick,
  testId,
  title,
}: Omit<ButtonIconProps, 'icon'>) => (
  <ButtonIcon
    classNames={`text-grey-500 active:text-grey-800 focus:text-grey-800 ${classNames}`}
    icon={[TrashIcon, 16, 22]}
    {...{ disabled, gleanDataAttrs, onClick, testId, title }}
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
    classNames={`text-grey-500 active:text-grey-900 focus:text-grey-900 ${classNames}`}
    icon={[RefreshIcon, 13, 12]}
    {...{ title, disabled, onClick, testId }}
  />
);

export default ButtonIcon;
