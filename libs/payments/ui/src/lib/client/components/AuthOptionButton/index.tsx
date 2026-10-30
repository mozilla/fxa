/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Image from 'next/image';
import chevronRightIcon from '@fxa/shared/assets/images/chevron-right.svg';

interface AuthOptionButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  leadingIcon: React.ReactNode;
  children: React.ReactNode;
}

export function AuthOptionButton({
  leadingIcon,
  children,
  className,
  type,
  ...props
}: AuthOptionButtonProps) {
  return (
    <button
      {...props}
      type={type ?? 'submit'}
      className={`w-full min-h-14 py-3 px-4 gap-4 rounded-md inline-flex items-center font-header text-start break-words text-grey-900 bg-grey-10 border border-grey-200 hover:bg-grey-100 hover:border-grey-300 active:bg-grey-300 active:border-grey-700 disabled:bg-grey-50 disabled:border-grey-100 disabled:text-grey-500 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 outline-offset-2 ${className ?? ''}`}
    >
      <span className="w-8 h-8 shrink-0 flex items-center justify-center">
        {leadingIcon}
      </span>
      <span className="flex-1 min-w-0 break-words">{children}</span>
      <span className="w-8 h-8 shrink-0 flex items-center justify-center ms-auto">
        <Image
          src={chevronRightIcon}
          alt=""
          aria-hidden="true"
          className="w-6 h-6 rtl:-scale-x-100"
        />
      </span>
    </button>
  );
}
