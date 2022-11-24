/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';

// TODO improve typing to allow either default or custom or both (but not none)
export type CardHeaderProps = {
  headingWithDefaultServiceFtlId: string;
  headingWithCustomServiceFtlId?: string;
  headingText: string;
  serviceName?: string;
};

const CardHeader = ({
  headingWithDefaultServiceFtlId,
  headingWithCustomServiceFtlId,
  headingText,
  serviceName,
}: CardHeaderProps) => {
  return (
    <header>
      {serviceName && headingWithCustomServiceFtlId ? (
        <FtlMsg id={headingWithCustomServiceFtlId} vars={{ serviceName }}>
          <h1 className="card-header">
            {headingText}{' '}
            <span className="card-subheader">to continue to {serviceName}</span>
          </h1>
        </FtlMsg>
      ) : (
        <FtlMsg id={headingWithDefaultServiceFtlId}>
          <h1 className="card-header">
            {headingText}{' '}
            <span className="card-subheader">
              to continue to account settings
            </span>
          </h1>
        </FtlMsg>
      )}
    </header>
  );
};

export default CardHeader;
