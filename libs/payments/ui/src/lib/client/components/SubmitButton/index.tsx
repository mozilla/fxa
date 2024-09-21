/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import Image from 'next/image';
import { useFormStatus } from 'react-dom';
import spinnerWhiteImage from '@fxa/shared/assets/images/spinnerwhite.svg';
import { BaseButton, ButtonVariant } from '../BaseButton';

interface SubmitButtonProps {
  children: React.ReactNode;
  variant: ButtonVariant;
}

export function SubmitButton({
  children,
  variant,
  disabled,
  className,
  ...otherProps
}: SubmitButtonProps & React.HTMLProps<HTMLButtonElement>) {
  const { pending } = useFormStatus();
  const isSubmitting = pending;

  return (
    <BaseButton
      variant={variant}
      {...otherProps}
      disabled={isSubmitting || disabled}
      type="submit"
      className={className}
    >
      {isSubmitting ? (
        <Image
          src={spinnerWhiteImage}
          alt=""
          className="animate-spin h-9 w-9"
        />
      ) : (
        children
      )}
    </BaseButton>
  );
}
