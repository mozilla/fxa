/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useContext } from 'react';
import { useFtlMsgResolver } from '../../../models';

import Head from 'fxa-react/components/Head';
import { AppLayoutContext } from '../../AppLayout';
import ButtonBack from '../../ButtonBack';
import classNames from 'classnames';

type FlowContainerProps = {
  title?: string;
  subtitle?: string;
  onBackButtonClick?: (
    event:
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
      | React.KeyboardEvent<HTMLButtonElement>
  ) => void;
  hideBackButton?: boolean;
  localizedBackButtonTitle?: string;
  children?: React.ReactNode;
};

export const FlowContainer = ({
  title,
  subtitle,
  onBackButtonClick = () => window.history.back(),
  hideBackButton = false,
  localizedBackButtonTitle,
  children,
}: FlowContainerProps) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const inAppLayout = useContext(AppLayoutContext);
  const backButtonTitle = localizedBackButtonTitle
    ? localizedBackButtonTitle
    : ftlMsgResolver.getMsg('flow-container-back', 'Back');
  return (
    // Transparent border is for Windows HCM - to ensure there is a visible border around the card
    <div
      className="max-w-lg mx-auto mt-6 p-10 tablet:my-10 flex flex-col items-start bg-box shadow tablet:rounded-xl nova:rounded-2xl nova:mx-4 nova:[@media(min-width:34rem)]:mx-auto border border-transparent"
      data-testid="flow-container"
    >
      {!inAppLayout && <Head title={title} />}

      <div className="relative flex items-center">
        {!hideBackButton && (
          <ButtonBack
            onClick={onBackButtonClick}
            dataTestId="flow-container-back-btn"
            localizedTitle={backButtonTitle}
            localizedAriaLabel={backButtonTitle}
          />
        )}
        {title && (
          <h1 className="font-header text-md text-deemphasized nova:font-semibold">
            {title}
          </h1>
        )}
      </div>
      {subtitle && (
        <h2 className="text-xs text-deemphasized font-semibold uppercase mt-1">
          {subtitle}
        </h2>
      )}
      <div
        className={classNames('w-full flex flex-col', {
          'mt-2': title || subtitle,
        })}
      >
        {children}
      </div>
    </div>
  );
};

export default FlowContainer;
