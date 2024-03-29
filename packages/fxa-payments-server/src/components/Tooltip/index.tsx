/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This is a React version of this Bootstrap view:
// https://github.com/mozilla/fxa/blob/main/packages/fxa-content-server/app/scripts/views/tooltip.js

import React, { useEffect, useRef, useContext } from 'react';
import classNames from 'classnames';
import ScreenInfo from '../../lib/screen-info';
import { AppContext } from '../../lib/AppContext';

export const PADDING_BELOW_TOOLTIP_PX = 2;
export const PADDING_ABOVE_TOOLTIP_PX = 4;

// These values should be the same as the breakpoints in
// https://github.com/mozilla/fxa/blob/main/packages/fxa-content-server/app/styles/_breakpoints.scss
export const MIN_HEIGHT_TO_SHOW_TOOLTIP_BELOW = 480;
export const MIN_WIDTH_TO_SHOW_TOOLTIP_BELOW = 520;

export type TooltipProps = {
  children: string | React.ReactNode;
  parentRef: React.RefObject<any>;
  id?: string;
  showBelow?: boolean;
  dismissible?: boolean;
  onDismiss?: (ev: React.MouseEvent) => void;
  extraClassNames?: string;
  screenInfo?: ScreenInfo;
};

export const Tooltip = ({
  children,
  parentRef,
  id = '',
  showBelow = true,
  dismissible = false,
  onDismiss = () => {},
  extraClassNames = '',
}: TooltipProps) => {
  const { getScreenInfo } = useContext(AppContext);
  const screenInfo = getScreenInfo();
  const { clientHeight = 1000, clientWidth = 1000 } = screenInfo;

  const doShowBelow =
    showBelow &&
    clientHeight >= MIN_HEIGHT_TO_SHOW_TOOLTIP_BELOW &&
    clientWidth >= MIN_WIDTH_TO_SHOW_TOOLTIP_BELOW;

  const tooltipRef = useRef<HTMLElement>(null);

  // After initial render, nudge tooltip position relative to parent element
  useEffect(() => {
    const tooltipEl = tooltipRef.current;
    const parentEl = parentRef.current;
    if (tooltipEl && parentEl) {
      tooltipEl.style.top = doShowBelow
        ? parentEl.offsetTop +
          parentEl.offsetHeight +
          PADDING_ABOVE_TOOLTIP_PX +
          'px'
        : parentEl.offsetTop +
          (0 - tooltipEl.offsetHeight - PADDING_BELOW_TOOLTIP_PX) +
          'px';
    }
  }, [doShowBelow, tooltipRef, parentRef]);

  const asideClassNames = [
    'tooltip',
    extraClassNames,
    doShowBelow ? 'tooltip-below fade-up-tt' : 'fade-down-tt',
  ];

  return (
    <aside
      ref={tooltipRef}
      id={id}
      className={classNames(...asideClassNames)}
      role="alert"
    >
      {children}
      {dismissible && (
        <span
          data-testid="dismiss-button"
          onClick={onDismiss}
          className="dismiss"
          tabIndex={2}
        >
          &#10005;
        </span>
      )}
    </aside>
  );
};

export default Tooltip;
