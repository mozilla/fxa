/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { ReactComponent as BackArrow } from './back-arrow.svg';
import { useFtlMsgResolver } from '../../models';

interface ButtonBackProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  dataTestId?: string;
  localizedAriaLabel?: string;
  localizedTitle?: string;
}

// This component assumes a parent container with class 'relative flex'
// and an adjacent text element.
const ButtonBack = ({
  onClick = () => window.history.back(),
  dataTestId,
  localizedAriaLabel,
  localizedTitle,
}: ButtonBackProps) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const localizedButtonTitle =
    localizedTitle || ftlMsgResolver.getMsg('button-back-title', 'Back');
  const localizedButtonAriaLabel =
    localizedAriaLabel ||
    ftlMsgResolver.getMsg('button-back-aria-label', 'Back');

  return (
    <button
      {...{ onClick }}
      data-testid={dataTestId}
      title={localizedButtonTitle}
      aria-label={localizedButtonAriaLabel}
      className="me-4 tablet:me-0 tablet:p-4 tablet:absolute tablet:-start-24"
    >
      <BackArrow className="w-6 h-auto text-grey-400 rtl:transform rtl:-scale-x-100" />
    </button>
  );
};

export default ButtonBack;
