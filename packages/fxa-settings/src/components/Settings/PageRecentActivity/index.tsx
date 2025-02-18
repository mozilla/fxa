/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps } from '@reach/router';

import FlowContainer from '../FlowContainer';
import { useAccount, useFtlMsgResolver } from '../../../models';
import { SecurityEvent as SecurityEventSection } from './SecurityEvent';
import React, { useState, useEffect } from 'react';

export const PageRecentActivity = (_: RouteComponentProps) => {
  const account = useAccount();
  const [securityEvents, setSecurityEvents] = useState(account.securityEvents);

  useEffect(() => {
    (async () => {
      const securityEvents = await account.getSecurityEvents();
      setSecurityEvents(securityEvents);
    })();
  }, [account]);

  const ftlMsgResolver = useFtlMsgResolver();

  return (
    <FlowContainer
      title={ftlMsgResolver.getMsg(
        'recent-activity-title',
        'Recent account activity'
      )}
    >
      <ol className="mt-5 relative border-s border-gray-100">
        {!!securityEvents &&
          securityEvents.map((securityEvent) => (
            <SecurityEventSection
              {...{
                key: securityEvent.name + securityEvent.createdAt,
                name: securityEvent.name,
                createdAt: securityEvent.createdAt,
              }}
            />
          ))}
      </ol>
    </FlowContainer>
  );
};

export default PageRecentActivity;
