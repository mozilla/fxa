/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { RouteComponentProps, useLocation, Link } from '@reach/router';
import { ReactComponent as BackArrow } from './back-arrow.svg';

type FlowContainerProps = {
  title?: string;
  backRoute?: string;
  children?: React.ReactElement;
};

export const FlowContainer = ({
  title,
  backRoute,
  children,
}: FlowContainerProps & RouteComponentProps) => {
  const location = useLocation();
  const backRoutePath =
    (backRoute ? backRoute : '/beta/settings') + location.search;
  return (
    <div className="flex" data-testid="flow-container">
      <Link
        to={backRoutePath}
        className="pt-7 pr-6"
        data-testid="flow-container-back-btn"
      >
        <BackArrow role="img" className="inline h-8 w-8" />
      </Link>
      <div className="bg-white shadow container pl-6 pr-10 pb-10">
        <h1 className="font-header pt-8 pb-4">{title}</h1>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default FlowContainer;
