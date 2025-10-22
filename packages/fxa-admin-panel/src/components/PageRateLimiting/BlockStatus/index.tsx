/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { BlockStatus as BlockStatusData } from 'fxa-admin-server/src/graphql';
import { getFormattedDuration, getFormattedDate } from '../../../lib/utils';

interface BlockStatusProps {
  status: BlockStatusData;
}

const StatusField = ({ label, value }) => {
  return (
    <li className="mb-2">
      <span className="font-medium text-sm text-grey-700">{label}:</span>
      <span className="ml-2 text-sm">{value}</span>
    </li>
  );
};

export const BlockStatus = ({ status }: BlockStatusProps) => {
  const getBlockingOnLabel = () => {
    switch (status.blockingOn) {
      case 'ip':
        return 'IP Address';
      case 'email':
        return 'Email';
      case 'uid':
        return 'UID';
      case 'ip_email':
        return 'IP + Email';
      case 'ip_uid':
        return 'IP + UID';
      default:
        return status.blockingOn;
    }
  };

  return (
    <div className="border border-grey-200 bg-grey-50 rounded-md p-4">
      <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4">
        <ul>
          <StatusField label="Action" value={status.action} />
          <StatusField label="Policy" value={status.policy} />
          <StatusField label="Reason" value={status.reason} />
          <StatusField label="Blocking On" value={getBlockingOnLabel()} />
        </ul>

        <ul>
          <StatusField
            label="Start Time"
            value={getFormattedDate(status.startTime)}
          />
          <StatusField
            label="Duration"
            value={getFormattedDuration(status.duration)}
          />
          <StatusField
            label="Retry After"
            value={getFormattedDuration(Math.round(status.retryAfter / 1000))}
          />
          <StatusField label="Attempt" value={status.attempt} />
        </ul>
      </div>
    </div>
  );
};
