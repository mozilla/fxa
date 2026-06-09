/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import Image from 'next/image';
import { Localized } from '@fluent/react';

import infoIcon from '@fxa/shared/assets/images/infoBlack.svg';

interface BusinessEntitlement {
  clientId: string;
  displayName: string;
  description?: string | null;
  capabilities: string[];
}

interface BusinessEntitlementContentProps {
  entitlement: BusinessEntitlement;
}

export const BusinessEntitlementContent = ({
  entitlement,
}: BusinessEntitlementContentProps) => {
  const { displayName, description } = entitlement;

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-start justify-between mt-4 tablet:mt-0">
        <h3 className="font-bold text-lg">{displayName}</h3>
      </div>
      <div className="bg-grey-10 leading-6 p-4 rounded-lg flex flex-col gap-2">
        <div className="flex items-start gap-2">
          <Image
            src={infoIcon}
            alt=""
            width={20}
            height={20}
            aria-hidden="true"
          />
          <Localized id="business-entitlement-content-access-granted">
            <p className="text-sm">
              You have access to this service through your organization.
            </p>
          </Localized>
        </div>
        {description && <p className="text-sm text-grey-500">{description}</p>}
      </div>
    </div>
  );
};
