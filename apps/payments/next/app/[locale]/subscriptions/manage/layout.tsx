/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Breadcrumbs } from '@fxa/payments/ui';
import { config } from 'apps/payments/next/config';

export default async function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Breadcrumbs
        contentServerUrl={config.contentServerUrl}
        paymentsNextUrl={config.paymentsNextHostedUrl}
      />

      <div className="flex justify-center">{children}</div>
    </>
  );
}
