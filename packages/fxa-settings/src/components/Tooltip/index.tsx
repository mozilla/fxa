/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ReactNode } from 'react';
import classNames from 'classnames';

export type TooltipType = 'default' | 'error';
export type PositionType = 'top' | 'bottom';

type TooltipProps = {
  message: string;
  type?: TooltipType;
  anchorLeft?: boolean;
  className?: string;
  position?: PositionType;
};

export const Tooltip = ({
  message,
  className,
  type = 'default',
  anchorLeft = false,
  position = 'top',
}: TooltipProps) => {
  const bgColor = type === 'error' ? 'red-600' : 'grey-500';
  // caret position and the positioning rule for tooltip are actually the opposite
  // of the passed in position;
  const oppositePositionRule = {
    top: 'bottom',
    bottom: 'top',
  }[position];

  return (
    <div
      data-testid="tooltip"
      title={message}
      className={classNames(
        `z-50 absolute py-2 px-6 text-center text-white
         p-3 rounded text-xs left-0 font-header font-bold
         ${oppositePositionRule}-full shadow-tooltip-grey-drop
         `,
        `bg-${bgColor}`,
        className,
        {
          'left-1/2 transform -translate-x-1/2': !anchorLeft,
          'left-0': anchorLeft,
        }
      )}
    >
      <span
        className={classNames(
          `absolute caret-${oppositePositionRule}-${type}
            ${position}-full`,
          {
            'left-1/2 transform -translate-x-1/2': !anchorLeft,
            'left-ten': anchorLeft,
          }
        )}
      />
      {message}
    </div>
  );
};

export default Tooltip;
