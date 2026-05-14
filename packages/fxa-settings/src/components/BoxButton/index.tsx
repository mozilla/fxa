/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { ChevronRightIcon, LoadingArrowIcon } from '../Icons';

export interface BoxButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  leadingIcon?: React.ReactNode;
  /** Defaults to a chevron-right; swapped for a spinner when loading. */
  trailingIcon?: React.ReactNode;
  isLoading?: boolean;
  children: React.ReactNode;
}

const BoxButton = ({
  leadingIcon,
  trailingIcon,
  isLoading = false,
  children,
  className,
  disabled,
  type,
  ...rest
}: BoxButtonProps) => {
  const resolvedTrailingIcon = isLoading ? (
    <LoadingArrowIcon className="w-5 h-5 animate-spin-slow" ariaHidden />
  ) : (
    (trailingIcon ?? (
      <ChevronRightIcon className="w-6 h-6 rtl:-scale-x-100" ariaHidden />
    ))
  );

  return (
    <button
      type={type ?? 'button'}
      disabled={disabled || isLoading}
      className={`w-full min-h-14 py-3 px-4 gap-4 rounded-md inline-flex items-center
        font-header text-start break-words
        text-grey-900 dark:text-grey-10
        bg-grey-10 dark:bg-grey-600
        border border-grey-200 dark:border-grey-500
        hover:bg-grey-100 hover:border-grey-300 dark:hover:bg-grey-500
        active:bg-grey-300 active:border-grey-700
        disabled:bg-grey-50 disabled:border-grey-100 disabled:text-grey-500
        dark:disabled:bg-grey-700 dark:disabled:border-grey-600 dark:disabled:text-grey-300
        disabled:cursor-not-allowed
        disabled:hover:bg-grey-50 disabled:hover:border-grey-100
        dark:disabled:hover:bg-grey-700 dark:disabled:hover:border-grey-600
        focus-visible-default outline-offset-2
        ${className ?? ''}`}
      {...rest}
    >
      {leadingIcon !== undefined && (
        <span className="w-8 h-8 shrink-0 flex items-center justify-center">
          {leadingIcon}
        </span>
      )}
      <span className="flex-1 min-w-0 break-words">{children}</span>
      <span className="w-8 h-8 shrink-0 flex items-center justify-center ms-auto">
        {resolvedTrailingIcon}
      </span>
    </button>
  );
};

export default BoxButton;
