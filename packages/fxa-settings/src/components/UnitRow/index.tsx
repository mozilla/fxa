/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useRef } from 'react';
import classNames from 'classnames';
import { useFocusOnTriggeringElementOnClose } from '../../lib/hooks';
import { Link, RouteComponentProps, useLocation } from '@reach/router';

type ModalButtonProps = {
  ctaText: string;
  className?: string;
  revealModal: () => void;
  modalRevealed?: boolean;
  alertBarRevealed?: boolean;
  leftSpaced?: boolean;
};

export const ModalButton = ({
  ctaText,
  className,
  revealModal,
  modalRevealed,
  alertBarRevealed,
  leftSpaced,
}: ModalButtonProps) => {
  const modalTriggerElement = useRef<HTMLButtonElement>(null);
  // If the UnitRow children contains an AlertBar that is revealed,
  // don't redirect focus back to the element that opened the modal
  // because focus will be set in the AlertBar.
  useFocusOnTriggeringElementOnClose(
    modalRevealed,
    modalTriggerElement,
    alertBarRevealed
  );

  return (
    <button
      className={classNames(
        'cta-base transition-standard',
        leftSpaced && 'ml-2',
        className || 'cta-neutral'
      )}
      data-testid="unit-row-modal"
      ref={modalTriggerElement}
      onClick={revealModal}
    >
      {ctaText}
    </button>
  );
};

type UnitRowProps = {
  header: string;
  headerValue: string | null;
  noHeaderValueText?: string;
  ctaText?: string;
  secondaryCtaText?: string;
  secondaryCtaRoute?: string;
  secondaryButtonClassName?: string;
  children?: React.ReactNode;
  headerValueClassName?: string;
  route?: string;
  revealModal?: () => void;
  revealSecondaryModal?: () => void;
  alertBarRevealed?: boolean;
};

export const UnitRow = ({
  header,
  headerValue,
  route,
  children,
  headerValueClassName,
  noHeaderValueText = 'None',
  ctaText,
  secondaryCtaText = 'Disable',
  secondaryCtaRoute,
  secondaryButtonClassName,
  revealModal,
  revealSecondaryModal,
  alertBarRevealed,
}: UnitRowProps & RouteComponentProps) => {
  ctaText = ctaText || (headerValue ? 'Change' : 'Add');

  const location = useLocation();
  const multiButton = !!(route || secondaryCtaRoute);

  return (
    <div className="unit-row">
      <div className="unit-row-header">
        <h3 data-testid="unit-row-header">{header}</h3>
      </div>
      <div className="unit-row-content">
        <p
          className={classNames('font-bold', headerValueClassName)}
          data-testid="unit-row-header-value"
        >
          {headerValue || noHeaderValueText}
        </p>
        {children}
      </div>

      <div className="unit-row-actions">
        <div className="flex items-center">
          {route && (
            <Link
              className="cta-neutral cta-base transition-standard mr-2"
              data-testid="unit-row-route"
              to={`${route}${location.search}`}
            >
              {ctaText}
            </Link>
          )}

          {revealModal && (
            <ModalButton
              leftSpaced={multiButton}
              {...{ revealModal, ctaText, alertBarRevealed }}
            />
          )}

          {secondaryCtaRoute && (
            <Link
              className="cta-neutral cta-base transition-standard mr-2"
              data-testid="unit-row-route"
              to={`${secondaryCtaRoute}${location.search}`}
            >
              {secondaryCtaText}
            </Link>
          )}

          {revealSecondaryModal && (
            <ModalButton
              leftSpaced={multiButton}
              revealModal={revealSecondaryModal}
              ctaText={secondaryCtaText}
              className={secondaryButtonClassName}
              alertBarRevealed={alertBarRevealed}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default UnitRow;
