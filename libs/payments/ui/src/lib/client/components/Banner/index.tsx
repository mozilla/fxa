/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import classNames from 'classnames';
import Image from 'next/image';
import { useState } from 'react';
import closeIcon from '@fxa/shared/assets/images/icon_close.min.svg';
import checkmarkIcon from '@fxa/shared/assets/images/icon_checkmark_circle_outline_current.min.svg';
import errorIcon from '@fxa/shared/assets/images/icon_error_circle_outline_current.min.svg';
import infoIcon from '@fxa/shared/assets/images/icon_information_circle_outline_current.min.svg';
import { BannerVariant } from '../../../constants';

interface BannerProps extends React.HTMLProps<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
  variant: BannerVariant;
}

export function Banner({
  children,
  variant,
  showCloseButton,
  ...props
}: BannerProps) {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  let bannerAriaLive: 'assertive' | 'polite';
  let bannerIcon: string;
  let bannerRole: 'alert' | 'status';
  let bannerStyle: string;
  let closeStyle: string;

  switch (variant) {
    case BannerVariant.Error:
      bannerAriaLive = 'assertive';
      bannerIcon = errorIcon;
      bannerRole = 'alert';
      bannerStyle = 'bg-red-100';
      closeStyle = 'hover:bg-red-200 focus:bg-red-300';
      break;
    case BannerVariant.Success:
      bannerAriaLive = 'polite';
      bannerIcon = checkmarkIcon;
      bannerRole = 'status';
      bannerStyle = 'bg-green-200';
      closeStyle = 'hover:bg-green-300 focus:bg-green-500';
      break;
    case BannerVariant.Info:
    default:
      bannerAriaLive = 'polite';
      bannerIcon = infoIcon;
      bannerRole = 'status';
      bannerStyle = 'bg-blue-50';
      closeStyle = 'hover:bg-blue-100 focus:bg-blue-200';
      break;
  }

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      {...props}
      className={classNames(
        'my-4 flex flex-row no-wrap items-center px-4 py-3 gap-3.5 rounded-md border border-transparent text-start text-sm',
        bannerStyle,
        props.className
      )}
      role={bannerRole}
      aria-live={bannerAriaLive}
      tabIndex={-1}
    >
      <Image
        src={bannerIcon}
        alt=""
        width={24}
        height={24}
        className="shrink-0 self-center"
        aria-hidden
      />
      <div className="flex flex-col grow font-bold">{children}</div>
      {showCloseButton && (
        <button
          aria-label="Close banner"
          className={classNames(
            'shrink-0 self-start hover:backdrop-saturate-150 focus:backdrop-saturate-200',
            closeStyle
          )}
          type="button"
          data-testid="close-banner"
          onClick={handleClose}
        >
          <Image src={closeIcon} alt="" width={24} height={24} />
        </button>
      )}
    </div>
  );
}
