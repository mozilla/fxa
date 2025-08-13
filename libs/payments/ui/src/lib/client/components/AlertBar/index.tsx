/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use client';

import { Localized } from '@fluent/react';
import classNames from 'classnames';
import * as Dialog from '@radix-ui/react-dialog';
import Image from 'next/image';
import checkLogo from '@fxa/shared/assets/images/check.svg';
import closeIcon from '@fxa/shared/assets/images/close.svg';
import { useEffect, useState } from 'react';

export enum AlertBarVariant {
  ERROR,
  SUCCESS,
}

export type AlertBarProps = {
  checked?: boolean;
  children: React.ReactNode;
  ariaId?: string;
  variant?: AlertBarVariant;
  onClick?: () => any;
  containerRef?: HTMLElement | null;
};

export const AlertBar = ({
  checked,
  children,
  variant = AlertBarVariant.ERROR,
  ariaId,
  onClick,
  containerRef = null,
}: AlertBarProps) => {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!containerRef) {
      setContainer(document.getElementById('header'));
    }
  }, []);

  let alertTypeStyle;
  switch (variant) {
    case AlertBarVariant.ERROR:
      alertTypeStyle = 'bg-red-600 text-white';
      break;

    case AlertBarVariant.SUCCESS:
      alertTypeStyle = 'bg-grey-700 text-white';
      break;
  }

  return (
    <>
      <Dialog.Root open={true} modal={false}>
        <Dialog.Portal container={container}>
          <Dialog.Content
            className={
              'left-0 w-full  absolute flex font-medium items-center justify-center pt-32 tablet:pt-40'
            }
          >
            <div
              aria-labelledby={ariaId}
              className={classNames(
                'w-2/3 tablet:w-[640px] flex font-medium items-center justify-center min-h-[32px] my-1 mx-auto p-2 relative rounded-md text-sm tablet:max-w-[640px]',
                alertTypeStyle
              )}
              data-testid="alert-container"
              role="dialog"
            >
              <div className="text-center w-[80%]">
                {checked && (
                  <Image
                    src={checkLogo}
                    alt=""
                    className="h-4 my-0 mx-1 relative top-[3px] w-4"
                  />
                )}
                {children}
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
                    <Image src={closeIcon} alt="" className="w-4 h-4" />
                  </span>
                </Localized>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};
export default AlertBar;
