/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';

type WarningMessageProps = {
  children: string;
  warningMessageFtlId: string;
  warningType: string;
};

const WarningMessage = ({
  children,
  warningMessageFtlId,
  warningType,
}: WarningMessageProps) => {
  return (
    <div className="mt-5 mb-8 text-xs" data-testid="warning-message-container">
      <FtlMsg
        id={warningMessageFtlId}
        elems={{
          span: <span className="text-red-600 uppercase">{warningType}</span>,
        }}
      >
        <p>
          <span className="text-red-600 uppercase">{warningType}</span>{' '}
          {children}
        </p>
      </FtlMsg>
    </div>
  );
};

export default WarningMessage;
