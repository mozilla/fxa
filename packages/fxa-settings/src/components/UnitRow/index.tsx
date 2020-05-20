/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useRef } from 'react';
import { useFocusOnTriggeringElementOnClose } from '../../lib/hooks';

type UnitRowProps = {
  header: string;
  headerValue: string | null;
  noHeaderValueText?: string;
  noHeaderValueCtaText?: string;
  children?: React.ReactNode;
  route?: string;
  revealModal?: () => void;
  modalRevealed?: boolean;
};

// TO DO: accept a refresh button prop to use in for secondary email
// and recovery key, a delete icon next to secondary email, and
// conditionally display "disable" for two-step auth

export const UnitRow = ({
  header,
  headerValue,
  route,
  children,
  noHeaderValueText = 'None',
  noHeaderValueCtaText = 'Add',
  revealModal,
  modalRevealed,
}: UnitRowProps) => {
  const ctaText = headerValue ? 'Change' : noHeaderValueCtaText;

  const modalTriggerElement = useRef<HTMLButtonElement>(null);
  useFocusOnTriggeringElementOnClose(modalRevealed, modalTriggerElement);

  return (
    <div>
      <h4 data-testid="unit-row-header">{header}</h4>
      <div>
        <p data-testid="unit-row-header-value">
          {headerValue || noHeaderValueText}
        </p>
        {children}
      </div>

      <div>
        {route && (
          <a data-testid="unit-row-route" href={route}>
            {ctaText}
          </a>
        )}

        {revealModal && (
          <button
            data-testid="unit-row-modal"
            ref={modalTriggerElement}
            onClick={revealModal}
          >
            {ctaText}
          </button>
        )}
      </div>
    </div>
  );
};

export default UnitRow;
