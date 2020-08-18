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
    <div className="flex" data-testid="flow-container">
      <div className="mx-auto my-6 tablet:my-10 flex items-start bg-white shadow py-8 px-6 rounded-xl">
        <button
          onClick={() => window.history.back()}
          className="pr-6 desktop:pl-6 desktop:-ml-24"
          data-testid="flow-container-back-btn"
          title="Back"
        >
          <BackArrow className="inline h-8 w-8" />
        </button>
        <div className="desktop:ml-4">
          <h1 className="font-header">{title}</h1>
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
};

export default FlowContainer;
