/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { useEscKeydownEffect, useChangeFocusEffect } from '../../../lib/hooks';
import { ReactComponent as CloseIcon } from '@fxa/shared/assets/images/close.svg';
import { alertContent, alertType, alertVisible } from '../../../models';
import { useReactiveVar } from '@apollo/client';
import { useClickOutsideEffect } from 'fxa-react/lib/hooks';
import { useLocalization } from '@fluent/react';

export const typeClasses = {
  success: 'text-grey-900 bg-green-500 success',
  error: 'text-white bg-red-500 error',
  info: 'text-white bg-blue-500 info',
};

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
            data-testid="alert-bar-inner"
            // Transparent border is for Windows HCM - to ensure there is a border around the alert when background color is removed
            className={`max-w-2xl w-full desktop:min-w-sm flex shadow-md rounded font-bold text-sm border border-transparent ${
              typeClasses[alertType()]
            }`}
          >
            <div className="flex-1 py-2 px-8 text-center">
              <p data-testid="alert-bar-content">{alertContent()}</p>
            </div>
            <div className="flex">
              <button
                data-testid="alert-bar-dismiss"
                className={`self-center rounded-r h-full px-1 ${
                  typeClasses[alertType()]
                } hover:bg-black/20 active:bg-black/30`}
                onClick={() => alertVisible(false)}
                title={l10n.getString(
                  'alert-bar-close-message',
                  null,
                  'Close message'
                )}
              >
                <CloseIcon className="w-3 h-3 m-2 fill-current" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  return alertBar ? alertBar : null;
};

export default AlertBar;
