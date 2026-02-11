/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useRef, useState } from 'react';
import { useEscKeydownEffect, useChangeFocusEffect } from '../../../lib/hooks';
import { ReactComponent as CloseIcon } from '@fxa/shared/assets/images/close.svg';
import { alertContent, alertType, alertVisible } from '../../../models';
import { useReactiveVar } from '@apollo/client';
import { useClickOutsideEffect } from 'fxa-react/lib/hooks';
import { useLocalization } from '@fluent/react';
import classNames from 'classnames';

/**
 * AlertBar component displays an alert message at the top of the screen.
 * It supports different alert types such as error, info, success, and warning.
 * The component also handles click outside and escape key events to close the alert.
 *
 * The overflow check is performed to determine if the alert content exceeds the height limit (48px).
 * If the content overflows, the text alignment is set to start and overflow-wrap is applied to ensure
 * the content is displayed properly without breaking the layout.
 *
 * @returns {JSX.Element | null} The AlertBar component or null if not visible.
 */
export const AlertBar = () => {
  const { l10n } = useLocalization();
  const visible = useReactiveVar(alertVisible);
  const insideRef = useClickOutsideEffect<HTMLDivElement>(() => {
    // TODO: cleanup Portal component and references, FXA-2463
    // We don't want to automatically close the alert bar if a modal
    // is also open. There's at least one case where a modal could be
    // opened at the same time as the alert bar, and because the modal
    // takes precedence, we want to allow the user to see and read the
    // alert bar instead of closing them at the same time. We have to check
    // for `innerHTML` because when a modal is closed it is still in the DOM.
    if (!document.getElementById('modal')?.innerHTML) {
      alertVisible(false);
    }
  });

  // Although `role="alert" is usually sufficient to trigger a screenreader
  // without having to reset focus, if this component is rerendered before
  // it's removed from the DOM, the message won't be read. Setting focus
  // ensures screenreaders receive feedback and makes the "close" button
  // the next tabbable element after reveal.

  const alertBarInnerRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const checkOverflow = () => {
    if (alertBarInnerRef.current) {
      setIsOverflowing(alertBarInnerRef.current.scrollHeight > 48);
    }
  };

  useEffect(() => {
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => {
      window.removeEventListener('resize', checkOverflow);
    };
  }, []);

  useEffect(() => {
    checkOverflow();
  }, [alertBarInnerRef.current?.scrollHeight]);

  const tabFenceRef = useChangeFocusEffect();
  useEscKeydownEffect(() => alertVisible(false));
  const alertBar = visible && (
    <div
      id="alert-bar-root"
      data-testid="alert-bar-root"
      className="fixed z-10"
      ref={insideRef}
    >
      <div
        className="flex fixed justify-center mt-2 mx-2 right-0 left-0"
        role="alert"
        data-testid="alert-bar"
      >
        <div
          tabIndex={0}
          ref={tabFenceRef}
          data-testid="alert-bar-tab-fence"
          className="outline-none"
        >
          <div
            ref={alertBarInnerRef}
            data-testid="alert-bar-inner"
            className={classNames(
              'max-w-full desktop:max-w-2xl w-full desktop:min-w-sm flex shadow-md rounded-sm text-sm font-medium text-grey-700 border border-transparent',
              {
                'bg-red-100 error': alertType() === 'error',
                'bg-blue-50 info': alertType() === 'info',
                'bg-green-200 success': alertType() === 'success',
                'bg-orange-50 warning': alertType() === 'warning',
              }
            )}
          >
            <p
              className={classNames(
                'flex-1 py-2 px-8',
                isOverflowing
                  ? 'text-start [overflow-wrap:anywhere]'
                  : 'text-center'
              )}
            >
              {alertContent()}
            </p>
            <button
              className={classNames(
                'shrink-0 items-stretch justify-center py-2 px-3 focus-visible:rounded-sm focus-visible-default',
                {
                  'hover:bg-red-200 focus:bg-red-300': alertType() === 'error',
                  'hover:bg-blue-100 focus:bg-blue-200': alertType() === 'info',
                  'hover:bg-green-300 focus:bg-green-500':
                    alertType() === 'success',
                  'hover:bg-orange-100 focus:bg-orange-200':
                    alertType() === 'warning',
                }
              )}
              onClick={() => alertVisible(false)}
              title={l10n.getString(
                'alert-bar-close-message',
                null,
                'Close message'
              )}
            >
              <CloseIcon className="w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  return alertBar ? alertBar : null;
};

export default AlertBar;
