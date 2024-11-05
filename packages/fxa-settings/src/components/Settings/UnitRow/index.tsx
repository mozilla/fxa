/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useRef } from 'react';
import Avatar from '../Avatar';
import { Account } from '../../../models/Account';
import classNames from 'classnames';
import { useFocusOnTriggeringElementOnClose } from '../../../lib/hooks';
import { Link, RouteComponentProps, useLocation } from '@reach/router';
import { useLocalization } from '@fluent/react';
import { AlertFullIcon, CheckmarkGreenIcon } from '../../Icons';

type ModalButtonProps = {
  ctaText: string;
  className?: string;
  revealModal: () => void;
  modalRevealed?: boolean;
  alertBarRevealed?: boolean;
  prefixDataTestId?: string;
};

export const ModalButton = ({
  ctaText,
  className,
  revealModal,
  modalRevealed,
  alertBarRevealed,
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
        'cta-base-common transition-standard',
        className || 'cta-neutral cta-base-p',
        'w-full @mobileLandscape/unitRow:w-auto @mobileLandscape/unitRow:text-xs @mobileLandscape/unitRow:py-1 @mobileLandscape/unitRow:px-5 @mobileLandscape/unitRow:mt-0'
      )}
      data-testid={formatDataTestId('unit-row-modal')}
      ref={modalTriggerElement}
      onClick={revealModal}
    >
      {ctaText}
    </button>
  );
};

export type UnitRowProps = {
  avatar?: Account['avatar'];
  header: string;
  headerId?: string;
  headerValue?: string | boolean;
  hideHeaderValue?: boolean;
  defaultHeaderValueText?: string;
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
  disabled?: boolean;
  disabledReason?: string;
  ctaOnClickAction?: () => void;
  statusIcon?: 'checkmark' | 'alert';
  subRows?: React.ReactNode;
};

export const UnitRow = ({
  avatar,
  header,
  headerId,
  headerValue,
  hideHeaderValue = false,
  route,
  children,
  headerContent,
  actionContent,
  headerValueClassName,
  defaultHeaderValueText,
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
  disabled = false,
  disabledReason = '',
  ctaOnClickAction,
  statusIcon,
  subRows,
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

  defaultHeaderValueText =
    defaultHeaderValueText ||
    l10n.getString('row-defaults-status', null, 'None');
  secondaryCtaText =
    secondaryCtaText ||
    l10n.getString('row-defaults-action-disable', null, 'Disable');
  ctaText = ctaText || (headerValue ? localizedCtaChange : localizedCtaAdd);

  const location = useLocation();

  function formatDataTestId(id: string) {
    return prefixDataTestId ? `${prefixDataTestId}-${id}` : id;
  }

  return (
    <div className="unit-row @container/row">
      <div className="font-header w-full mb-1 mobileLandscape:flex-none mobileLandscape:mb-0 mobileLandscape:me-2 mobileLandscape:w-40">
        <span className="flex justify-between items-center">
          <h3
            data-testid={formatDataTestId('unit-row-header')}
            id={headerId}
            className="scroll-mt-32 break-word"
          >
            {header}
          </h3>
          {headerContent && <span>{headerContent}</span>}
        </span>
      </div>
      <div className="flex flex-col w-full @container/unitRow">
        <div className="w-full @mobileLandscape/unitRow:flex">
          <div className="unit-row-content">
            {avatar ? (
              <Avatar
                className="mx-auto @mobileLandscape/unitRow:mx-0 w-32 @mobileLandscape/unitRow:w-16 text-center"
                {...{ avatar }}
              />
            ) : (
              !hideHeaderValue && (
                <div className="flex gap-2">
                  {statusIcon && statusIcon === 'checkmark' && (
                    <CheckmarkGreenIcon className="scale-125" mode="enabled" />
                  )}
                  {statusIcon && statusIcon === 'alert' && (
                    <AlertFullIcon className="scale-125" mode="attention" />
                  )}
                  <p
                    className={classNames('font-bold', headerValueClassName)}
                    data-testid={formatDataTestId('unit-row-header-value')}
                  >
                    {headerValue || defaultHeaderValueText}
                  </p>
                </div>
              )
            )}
            {children}
          </div>

          {(actionContent ||
            route ||
            revealModal ||
            secondaryCtaRoute ||
            revealSecondaryModal) && (
            <div className="unit-row-actions @mobileLandscape/unitRow:flex-1 @mobileLandscape/unitRow:flex @mobileLandscape/unitRow:justify-end ">
              <div className="flex items-center h-8 gap-2 mt-2 @mobileLandscape/unitRow:mt-0 ">
                {disabled ? (
                  <button
                    className="cta-neutral cta-base-common cta-base-p transition-standard me-1 w-full @mobileLandscape/unitRow:w-auto @mobileLandscape/unitRow:text-xs @mobileLandscape/unitRow:py-1 @mobileLandscape/unitRow:px-5 @mobileLandscape/unitRow:mt-0"
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
                        className="cta-neutral cta-base-common cta-base-p transition-standard me-1 w-full @mobileLandscape/unitRow:w-auto @mobileLandscape/unitRow:text-xs @mobileLandscape/unitRow:py-1 @mobileLandscape/unitRow:px-5 @mobileLandscape/unitRow:mt-0"
                        data-testid={formatDataTestId('unit-row-route')}
                        to={`${route}${location.search}`}
                        onClick={ctaOnClickAction}
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
                        className="cta-neutral cta-base cta-base-p transition-standard me-1"
                        data-testid={formatDataTestId('unit-row-route')}
                        to={`${secondaryCtaRoute}${location.search}`}
                      >
                        {secondaryCtaText}
                      </Link>
                    )}

                    {revealSecondaryModal && (
                      <ModalButton
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
          )}
        </div>
        {subRows ? subRows : ''}
      </div>
    </div>
  );
};

export default UnitRow;
