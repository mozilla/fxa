/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import FlowContainer from '../FlowContainer';
import { useAccount, useFtlMsgResolver } from '../../../models';
import {
  HIDDEN_SECURITY_EVENT_NAMES,
  SecurityEvent as SecurityEventSection,
} from './SecurityEvent';
import { FtlMsg } from 'fxa-react/lib/utils';
import React, { useState, useEffect } from 'react';

// Number of events shown before the user asks for more.
export const INITIAL_EVENT_COUNT = 20;

export const PageRecentActivity = () => {
  const account = useAccount();
  const [securityEvents, setSecurityEvents] = useState(account.securityEvents);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    (async () => {
      const securityEvents = await account.getSecurityEvents();
      setSecurityEvents(securityEvents);
    })();
  }, [account]);

  const ftlMsgResolver = useFtlMsgResolver();

  // Filter first, then cap, so the page shows a full list of rows.
  const visibleEvents = (securityEvents ?? []).filter(
    (securityEvent) => !HIDDEN_SECURITY_EVENT_NAMES.has(securityEvent.name)
  );
  const eventsToShow = showAll
    ? visibleEvents
    : visibleEvents.slice(0, INITIAL_EVENT_COUNT);
  const hasMore = visibleEvents.length > INITIAL_EVENT_COUNT;

  return (
    <FlowContainer
      title={ftlMsgResolver.getMsg(
        'recent-activity-title',
        'Recent account activity'
      )}
    >
      <ol className="mt-5 relative border-s border-gray-100">
        {eventsToShow.map((securityEvent) => (
          <SecurityEventSection
            key={securityEvent.name + securityEvent.createdAt}
            {...{
              name: securityEvent.name,
              createdAt: securityEvent.createdAt,
            }}
          />
        ))}
      </ol>
      {!showAll && hasMore && (
        <FtlMsg id="recent-activity-show-more-button">
          <button
            type="button"
            className="cta-neutral cta-base-p mt-4 w-full"
            onClick={() => setShowAll(true)}
          >
            Show more
          </button>
        </FtlMsg>
      )}
    </FlowContainer>
  );
};

export default PageRecentActivity;
