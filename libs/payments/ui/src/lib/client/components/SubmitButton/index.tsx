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
}

export function SubmitButton({
  children,
  disabled,
  className,
  ...otherProps
}: SubmitButtonProps & React.HTMLProps<HTMLButtonElement>) {
  const { pending } = useFormStatus();

  return (
    <BaseButton
      variant={ButtonVariant.Primary}
      {...otherProps}
      disabled={pending || disabled}
      type="submit"
      className={className}
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
}
