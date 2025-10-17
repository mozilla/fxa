/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { BlockStatus as BlockStatusData } from 'fxa-admin-server/src/graphql';

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
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

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
            value={formatTimestamp(status.startTime)}
          />
          <StatusField
            label="Duration"
            value={formatDuration(status.duration)}
          />
          <StatusField
            label="Retry After"
            value={formatDuration(Math.round(status.retryAfter / 1000))}
          />
          <StatusField label="Attempt" value={status.attempt} />
        </ul>
      </div>
    </div>
  );
};
