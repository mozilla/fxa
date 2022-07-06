/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { ReactComponent as CloseIcon } from 'fxa-react/images/close.svg';
import { Localized } from '@fluent/react';
import Portal from 'fxa-react/components/Portal';
import './index.scss';

type AlertBarProps = {
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
  className = 'alert',
  dataTestId,
  elems,
  headerId,
  localizedId,
  onClick,
}: AlertBarProps) => {
  return (
    <Portal id="top-bar">
      <div
        aria-labelledby={headerId}
        className={className}
        data-testid="alert-container"
        role="dialog"
      >
        <Localized id={localizedId} elems={elems ? { div: actionButton } : undefined}>
          <span
            id={headerId}
            data-testid={dataTestId}
            className={checked ? "checked" : undefined}
          >
            {children}
          </span>
        </Localized>

        {onClick && <Localized id="close-aria">
            <span
              data-testid="clear-success-alert"
              className="close"
              aria-label="Close modal"
              onClick={() => onClick()}
              role="button"
            >
              <CloseIcon
                role="img"
                className="close-icon close-alert-bar"
                aria-hidden="true"
                focusable="false"
              />
            </span>
          </Localized>
        }
      </div>
    </Portal>
  );
};

export default AlertBar;
