/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import {
  FtlMsg,
  LocalizedDateOptions,
  getLocalizedDate,
} from 'fxa-react/lib/utils';

enum SecurityEventName {
  Create = 'account.create',
  Disable = 'account.disable',
  Enable = 'account.enable',
  Login = 'account.login',
  Reset = 'account.reset',
  ClearBounces = 'emails.clearBounces',
}

const getSecurityEventNameL10n = (name: string) => {
  switch (name) {
    case SecurityEventName.Create: {
      return {
        ftlId: 'recent-activity-account-create',
        fallbackText: 'Account was created',
      };
    }
    case SecurityEventName.Disable: {
      return {
        ftlId: 'recent-activity-account-disable',
        fallbackText: 'Account was disabled',
      };
    }
    case SecurityEventName.Enable: {
      return {
        ftlId: 'recent-activity-account-enable',
        fallbackText: 'Account was enabled',
      };
    }
    case SecurityEventName.Login: {
      return {
        ftlId: 'recent-activity-account-login',
        fallbackText: 'Account initiated login',
      };
    }
    case SecurityEventName.Reset: {
      return {
        ftlId: 'recent-activity-account-reset',
        fallbackText: 'Account initiated password reset',
      };
    }
    case SecurityEventName.ClearBounces: {
      return {
        ftlId: 'recent-activity-account-reset',
        fallbackText: 'Account cleared email bounces',
      };
    }
    default: {
      return {
        ftlId: 'recent-activity-unknown',
        fallbackText: 'Unknown',
      };
    }
  }
};

export function SecurityEvent({
  name,
  createdAt,
}: {
  name: string;
  createdAt: number;
  verified?: boolean;
}) {
  const createdAtDateText = Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(new Date(createdAt));

  const createdAtDateFluent = getLocalizedDate(
    createdAt,
    LocalizedDateOptions.NumericDateAndTime
  );

  const l10nName = getSecurityEventNameL10n(name);
  return (
    <li className="mt-5 ml-4" data-testid={l10nName.ftlId}>
      <div className="absolute w-3 h-3 bg-green-600 rounded-full mt-1.5 -left-1.5 border border-green-700"></div>
      <div className="text-grey-900 text-sm mobileLandscape:mt-3">
        <FtlMsg
          id="recent-activity-created-at"
          vars={{ date: createdAtDateFluent }}
        >
          {createdAtDateText}
        </FtlMsg>
      </div>
      <FtlMsg id={l10nName.ftlId}>
        <p className="text-grey-400 text-xs mobileLandscape:mt-3">
          {l10nName.fallbackText}
        </p>
      </FtlMsg>
    </li>
  );
}
export default SecurityEvent;
