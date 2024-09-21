/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { forwardRef } from 'react';
import { useAccount } from '../../../models';
import { Localized } from '@fluent/react';
import { LinkedAccount } from './LinkedAccount';

export const LinkedAccounts = forwardRef<HTMLDivElement>((_, ref) => {
  const account = useAccount();
  const linkedAccounts = account.linkedAccounts;

  return (
    <>
      {!!linkedAccounts.length && (
        <section
          data-testid="settings-linked-accounts"
          id="linked-accounts-section"
          {...{ ref }}
        >
          <h2 className="font-header font-bold mobileLandscape:ms-6 ms-4 mb-4 relative">
            <span id="linked-accounts" className="nav-anchor"></span>
            <Localized id="la-heading">Linked Accounts</Localized>
          </h2>
          <div className="bg-white tablet:rounded-xl shadow px-4 tablet:px-6 pt-7 pb-8">
            <div className="flex justify-between mb-4">
              <Localized id="la-description">
                <p>You have authorized access to the following accounts.</p>
              </Localized>
            </div>

            {linkedAccounts.map((linkedAccount) => (
              <LinkedAccount
                key={linkedAccount.providerId}
                providerId={linkedAccount.providerId}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
});

export default LinkedAccounts;
