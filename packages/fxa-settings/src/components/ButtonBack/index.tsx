/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { ReactComponent as BackArrow } from './back-arrow.svg';
import { useFtlMsgResolver } from '../../models';
import { getTextColorClassName } from 'fxa-react/lib/calculate-contrast';

interface ButtonBackProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  dataTestId?: string;
  localizedAriaLabel?: string;
  localizedTitle?: string;
  cmsBackgroundColor?: string;
}

// This component assumes a parent container with class 'relative flex'
// and an adjacent text element.
const ButtonBack = ({
  onClick = () => window.history.back(),
  dataTestId,
  localizedAriaLabel,
  localizedTitle,
  cmsBackgroundColor,
}: ButtonBackProps) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const localizedButtonTitle =
    localizedTitle || ftlMsgResolver.getMsg('button-back-title', 'Back');
  const localizedButtonAriaLabel =
    localizedAriaLabel ||
    ftlMsgResolver.getMsg('button-back-aria-label', 'Back');

  const getTabletArrowColor = () => {
    const defaultClasses = 'tablet:text-grey-400 tablet:hover:bg-grey-400/10';
    if (!cmsBackgroundColor) {
      return defaultClasses;
    }

    const textColorClass = getTextColorClassName(cmsBackgroundColor.trim());
    // Map to hardcoded class names for Tailwind tree shaking
    switch (textColorClass) {
      case 'text-white':
        return 'tablet:text-white tablet:hover:bg-white/10';
      case 'text-grey-600':
        return 'tablet:text-grey-600 tablet:hover:bg-grey-900/10';
      case 'text-grey-400':
      default:
        return defaultClasses;
    }
  };

  return (
    <button
      {...{ onClick }}
      data-testid={dataTestId}
      title={localizedButtonTitle}
      aria-label={localizedButtonAriaLabel}
      className={`me-4 tablet:me-0 p-2 tablet:absolute tablet:-start-24 rounded focus-visible-default text-grey-400 ${getTabletArrowColor()}`}
    >
      <BackArrow className="w-6 h-auto rtl:transform rtl:-scale-x-100" />
    </button>
  );
};

export default ButtonBack;
