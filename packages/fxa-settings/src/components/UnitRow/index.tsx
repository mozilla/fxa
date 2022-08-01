/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useRef } from 'react';
import Avatar from '../Avatar';
import { Account } from '../../models/Account';
import classNames from 'classnames';
import { useFocusOnTriggeringElementOnClose } from '../../lib/hooks';
import { Link, RouteComponentProps, useLocation } from '@reach/router';
import { useLocalization } from '@fluent/react';

type ModalButtonProps = {
  ctaText: string;
  className?: string;
  revealModal: () => void;
  modalRevealed?: boolean;
  alertBarRevealed?: boolean;
  leftSpaced?: boolean;
  prefixDataTestId?: string;
};

export const ModalButton = ({
  ctaText,
  className,
  revealModal,
  modalRevealed,
  alertBarRevealed,
  leftSpaced,
  prefixDataTestId = '',
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

  function formatDataTestId(id: string) {
    return prefixDataTestId ? `${prefixDataTestId}-${id}` : id;
  }

  return (
    <button
      className={classNames(
        'cta-base transition-standard',
        leftSpaced && 'ml-2',
        className || 'cta-neutral cta-base-p'
      )}
      data-testid={formatDataTestId('unit-row-modal')}
      ref={modalTriggerElement}
      onClick={revealModal}
    >
      {ctaText}
    </button>
  );
};

type UnitRowProps = {
  avatar?: Account['avatar'];
  header: string;
  headerId?: string;
  headerValue: string | null | boolean;
  noHeaderValueText?: string;
  ctaText?: string;
  secondaryCtaText?: string;
  secondaryCtaRoute?: string;
  secondaryButtonClassName?: string;
  secondaryButtonTestId?: string;
  children?: React.ReactNode;
  headerContent?: React.ReactNode;
  actionContent?: React.ReactNode;
  headerValueClassName?: string;
  route?: string;
  revealModal?: () => void;
  revealSecondaryModal?: () => void;
  alertBarRevealed?: boolean;
  hideCtaText?: boolean;
  prefixDataTestId?: string;
  isLevelWithRefreshButton?: boolean;
  disabled?: boolean;
  disabledReason?: string;
};

export const UnitRow = ({
  avatar,
  header,
  headerId,
  headerValue,
  route,
  children,
  headerContent,
  actionContent,
  headerValueClassName,
  noHeaderValueText,
  ctaText,
  secondaryCtaText,
  secondaryCtaRoute,
  secondaryButtonClassName,
  secondaryButtonTestId = 'secondary-button',
  revealModal,
  revealSecondaryModal,
  alertBarRevealed,
  hideCtaText,
  prefixDataTestId = '',
  isLevelWithRefreshButton = false,
  disabled = false,
  disabledReason = '',
}: UnitRowProps & RouteComponentProps) => {
  const { l10n } = useLocalization();
  const localizedCtaAdd = l10n.getString(
    'row-defaults-action-add',
    null,
    'Add'
  );
  const localizedCtaChange = l10n.getString(
    'row-defaults-action-change',
    null,
    'Change'
  );

  noHeaderValueText =
    noHeaderValueText || l10n.getString('row-defaults-status', null, 'None');
  secondaryCtaText =
    secondaryCtaText ||
    l10n.getString('row-defaults-action-disable', null, 'Disable');
  ctaText = ctaText || (headerValue ? localizedCtaChange : localizedCtaAdd);

  const location = useLocation();
  const multiButton = !!(route || secondaryCtaRoute);

  function formatDataTestId(id: string) {
    return prefixDataTestId ? `${prefixDataTestId}-${id}` : id;
  }

  return (
    <div className="unit-row">
      <div className="font-header w-full mb-1 mobileLandscape:flex-none mobileLandscape:mb-0 mobileLandscape:mr-2 mobileLandscape:w-40">
        <span className="flex justify-between items-center">
          <h3
            data-testid={formatDataTestId('unit-row-header')}
            id={headerId}
            className="scroll-mt-32"
          >
            {header}
          </h3>
          {headerContent && <span>{headerContent}</span>}
        </span>
      </div>
      <div className="unit-row-content">
        {avatar ? (
          <Avatar className="mx-auto mobileLandscape:mx-0 w-32 mobileLandscape:w-16" />
        ) : (
          <p
            className={classNames('font-bold', headerValueClassName)}
            data-testid={formatDataTestId('unit-row-header-value')}
          >
            {headerValue || noHeaderValueText}
          </p>
        )}
        {children}
      </div>

      <div className="unit-row-actions">
        <div className="flex items-center">
          {disabled ? (
            <button
              className={classNames(
                'cta-neutral cta-base cta-base-p transition-standard rtl:ml-1',
                isLevelWithRefreshButton && 'mobileLandscape:mr-9'
              )}
              data-testid={formatDataTestId('unit-row-route')}
              title={disabledReason}
              disabled={disabled}
            >
              {!hideCtaText && ctaText}
            </button>
          ) : (
            <>
              {!hideCtaText && route && (
                <Link
                  className={classNames(
                    'cta-neutral cta-base cta-base-p transition-standard rtl:ml-1',
                    isLevelWithRefreshButton && 'mobileLandscape:mr-9'
                  )}
                  data-testid={formatDataTestId('unit-row-route')}
                  to={`${route}${location.search}`}
                >
                  {ctaText}
                </Link>
              )}

              {revealModal && (
                <ModalButton
                  {...{
                    revealModal,
                    ctaText,
                    alertBarRevealed,
                    prefixDataTestId,
                  }}
                />
              )}

              {secondaryCtaRoute && (
                <Link
                  className="cta-neutral cta-base cta-base-p transition-standard ltr:mr-1 rtl:ml-1"
                  data-testid={formatDataTestId('unit-row-route')}
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
                  prefixDataTestId={secondaryButtonTestId}
                />
              )}
            </>
          )}
          {actionContent}
        </div>
      </div>
    </div>
  );
};

export default UnitRow;
