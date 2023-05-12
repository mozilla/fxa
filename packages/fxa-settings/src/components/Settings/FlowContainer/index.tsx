/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { useFtlMsgResolver } from '../../../models';
import { RouteComponentProps } from '@reach/router';
import { ReactComponent as BackArrow } from './back-arrow.svg';
import Head from 'fxa-react/components/Head';

type FlowContainerProps = {
  title?: string;
  subtitle?: string;
  onBackButtonClick?: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
  localizedBackButtonTitle?: string;
  children?: React.ReactNode;
};

export const FlowContainer = ({
  title,
  subtitle,
  onBackButtonClick = () => window.history.back(),
  localizedBackButtonTitle,
  children,
}: FlowContainerProps & RouteComponentProps) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const backButtonTitle = localizedBackButtonTitle
    ? localizedBackButtonTitle
    : ftlMsgResolver.getMsg('flow-container-back', 'Back');
  return (
    <div
      className="max-w-lg mx-auto mt-6 p-10 tablet:my-10 flex flex-col items-start bg-white shadow tablet:rounded-xl"
      data-testid="flow-container"
    >
      <Head title={title} />

      <div className="flex items-center">
        <button
          onClick={onBackButtonClick}
          data-testid="flow-container-back-btn"
          title={backButtonTitle}
          className="relative w-8 h-8 -ms-2 me-2 tablet:me-10 tablet:-ms-18"
        >
          <BackArrow className="w-8 h-auto pe-2 absolute top-1/2 start-1/4 transform -translate-y-1/2 ltr:-translate-x-1/2 rtl:translate-x-1/2 rtl:-scale-x-100 fill-current" />
        </button>
        <h1 className="font-header text-lg mb-1">{title}</h1>
      </div>
      {subtitle && (
        <h2 className="text-xs text-grey-400 font-semibold uppercase">
          {subtitle}
        </h2>
      )}
      <div className="w-full flex flex-col mt-2">{children}</div>
    </div>
  );
};

export default FlowContainer;
