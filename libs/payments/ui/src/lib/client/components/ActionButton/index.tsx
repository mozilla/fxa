/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import Image from 'next/image';
import spinnerWhiteImage from '@fxa/shared/assets/images/spinnerwhite.svg';
import { BaseButton, ButtonVariant } from '../BaseButton';
import { forwardRef } from 'react';

interface ActionButtonProps {
  children: React.ReactNode;
  pending: boolean;
  variant: ButtonVariant;
}

export const ActionButton = forwardRef(function SubmitButton({
  children,
  pending,
  disabled,
  className,
  variant,
  ...otherProps
}: ActionButtonProps & React.HTMLProps<HTMLButtonElement>, ref: React.Ref<HTMLButtonElement>) {
  return (
    <BaseButton
      variant={variant}
      {...otherProps}
      disabled={pending || disabled}
      aria-disabled={pending || disabled}
      type="submit"
      className={className}
      ref={ref}
    >
      {pending ? (
        <>
          <Image
            src={spinnerWhiteImage}
            alt=""
            className="absolute animate-spin h-8 w-8"
          />
          <div className="text-transparent">{children}</div>
        </>
      ) : (
        children
      )}
    </BaseButton>
  );
})
