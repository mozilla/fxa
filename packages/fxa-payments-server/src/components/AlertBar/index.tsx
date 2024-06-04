/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { ReactComponent as CloseIcon } from '@fxa/shared/assets/images/close.svg';
import { Localized } from '@fluent/react';
import classNames from 'classnames';
import Portal from 'fxa-react/components/Portal';
import checkLogo from '../../images/check.svg';

export type AlertBarProps = {
  actionButton?: any;
  checked?: boolean;
  children: any;
  className?: string;
  dataTestId: string;
  elems?: boolean;
  headerId: string;
  localizedId: string;
  onClick?: Function;
};

export const AlertBar = ({
  actionButton,
  checked,
  children,
  className,
  dataTestId,
  elems,
  headerId,
  localizedId,
  onClick,
}: AlertBarProps) => {
  let alertTypeStyle;
  switch (className) {
    case 'alert-error':
      alertTypeStyle = 'bg-red-600 text-white alert-error';
      break;

    case 'alert-newsletter-error':
      alertTypeStyle = 'bg-yellow-500';
      break;

    case 'alert-success':
      alertTypeStyle = 'bg-grey-700 text-white';
      break;

    case 'alert-pending':
    default:
      alertTypeStyle = 'bg-black/10';
      break;
  }

  return (
    <Portal id="top-bar">
      <div
        aria-labelledby={headerId}
        className={classNames(
          'flex font-medium items-center justify-center leading-5 min-h-[32px] my-1 mx-auto p-2 relative rounded-md text-sm w-full tablet:max-w-[640px]',
          alertTypeStyle
        )}
        data-testid="alert-container"
        role="dialog"
      >
        <div className="text-center w-[80%]">
          {checked && (
            <img
              src={checkLogo}
              className="h-4 my-0 mx-1 relative top-[3px] w-4"
              alt=""
            />
          )}

          <Localized
            id={localizedId}
            elems={elems ? { div: actionButton } : undefined}
          >
            <span id={headerId} data-testid={dataTestId}>
              {children}
            </span>
          </Localized>
        </div>

        {onClick && (
          <Localized id="close-aria">
            <span
              data-testid="clear-success-alert"
              className="grid"
              aria-label="Close modal"
              onClick={() => onClick()}
              role="button"
            >
              <CloseIcon
                role="img"
                className="w-4 h-4 absolute cursor-pointer fill-current justify-self-end right-4 top-2.5"
                aria-hidden="true"
                focusable="false"
              />
            </span>
          </Localized>
        )}
      </div>
    </Portal>
  );
};

export default AlertBar;
