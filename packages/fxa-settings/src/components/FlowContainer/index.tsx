/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { RouteComponentProps } from '@reach/router';
import { ReactComponent as BackArrow } from './back-arrow.svg';
import Head from 'fxa-react/components/Head';
import { useLocalization } from '@fluent/react';

type FlowContainerProps = {
  width?: 'sm' | 'md' | 'lg' | 'xl';
  title?: string;
  subtitle?: string;
  onBackButtonClick?: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
  children?: React.ReactNode;
};

export const FlowContainer = ({
  title,
  subtitle,
  onBackButtonClick = () => window.history.back(),
  children,
}: FlowContainerProps & RouteComponentProps) => {
  const { l10n } = useLocalization();
  return (
    <div
      className={`max-w-lg mx-auto mt-6 p-6 pb-7 tablet:my-10 flex flex-col items-start bg-white shadow tablet:rounded-xl`}
      data-testid="flow-container"
    >
      <Head title={title} />

      <div className="flex items-center">
        <button
          onClick={onBackButtonClick}
          data-testid="flow-container-back-btn"
          title={l10n.getString('flow-container-back', null, 'Back')}
          className="relative w-8 h-8 ltr:-ml-2 rtl:-mr-2 ltr:mr-2 rtl:ml-2 tablet:ltr:mr-10 tablet:rtl:ml-10 tablet:ltr:-ml-18 tablet:rtl:-mr-18"
        >
          <BackArrow
            width="16"
            height="14"
            className="absolute top-1/2 ltr:left-1/2 rtl:right-1/2 transform -translate-y-1/2 ltr:-translate-x-1/2 rtl:translate-x-1/2 rtl:-scale-x-1 fill-current"
          />
        </button>
        <h1 className="font-header">{title}</h1>
      </div>
      {subtitle && (
        <h2 className="text-xs text-grey-400 font-semibold uppercase">
          {subtitle}
        </h2>
      )}
      <div className="w-full">{children}</div>
    </div>
  );
};

export default FlowContainer;
