/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use client';

import { useLocalization } from '@fluent/react';
import classNames from 'classnames';
import * as Dialog from '@radix-ui/react-dialog';
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import Image from 'next/image';
import checkLogo from '@fxa/shared/assets/images/check.svg';
import closeIcon from '@fxa/shared/assets/images/close.svg';
import { useState } from 'react';

export enum AlertBarVariant {
  ERROR,
  SUCCESS,
}

export type AlertBarProps = {
  checked?: boolean;
  children: React.ReactNode;
  variant?: AlertBarVariant;
  containerRef?: HTMLElement | null;
};

export const AlertBar = ({
  checked,
  children,
  variant = AlertBarVariant.ERROR,
  containerRef = null,
}: AlertBarProps) => {
  const [openDialog, setOpenDialog] = useState(true);

  const { l10n } = useLocalization();

  let alertTypeStyle;
  switch (variant) {
    case AlertBarVariant.ERROR:
      alertTypeStyle = 'bg-red-100 error';
      break;

    case AlertBarVariant.SUCCESS:
      alertTypeStyle = 'bg-green-200 success';
      break;
  }

  return (
    <>
      <Dialog.Root open={openDialog} modal={false}>
        <Dialog.Portal container={containerRef}>
          <Dialog.Content
            className="flex absolute justify-center mx-2 mt-2 right-0 left-0 top-16 tablet:top-20 z-10"
          >
            <VisuallyHidden.Root asChild>
              <Dialog.Title
              >
                {l10n.getString('alert-dialog-title', null, 'Alert dialog')}
              </Dialog.Title>
            </VisuallyHidden.Root>
            <div
              className={classNames(
                'max-w-full tablet:max-w-2xl w-full desktop:min-w-sm flex shadow-md rounded-sm text-sm font-medium text-grey-700 border border-transparent outline-none',
                alertTypeStyle
              )}
              data-testid="alert-container"
            >
              <div className="flex-1 py-2 px-8 text-center outline-none">
                {checked && (
                  <Image
                    src={checkLogo}
                    alt=""
                    className="h-4 my-0 mx-1 relative top-[3px] w-4"
                  />
                )}
                {children}
              </div>
              <Dialog.Close asChild>
                <button
                  className={
                    classNames(
                      'shrink-0 items-stretch justify-center py-2 px-3 focus-visible:rounded-sm focus-visible-default outline-none',
                      alertTypeStyle
                    )
                  }
                  onClick={() => setOpenDialog(false)}
                >
                  <Image
                    src={closeIcon}
                    alt={l10n.getString('dialog-close', null, 'Close dialog')}
                  />
                </button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};
export default AlertBar;
