/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { RouteComponentProps } from '@reach/router';
import { ReactComponent as BackArrow } from './back-arrow.svg';

type FlowContainerProps = {
  title?: string;
  children?: React.ReactNode;
};

export const FlowContainer = ({
  title,
  children,
}: FlowContainerProps & RouteComponentProps) => {
  return (
    <div
      className="max-w-lg mx-auto mt-6 p-6 pb-7 tablet:my-10 flex flex-col items-start bg-white shadow tablet:rounded-xl"
      data-testid="flow-container"
    >
      <div className="flex items-center">
        <button
          onClick={() => window.history.back()}
          data-testid="flow-container-back-btn"
          title="Back"
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
      <div className="w-full">{children}</div>
    </div>
  );
};

export default FlowContainer;
