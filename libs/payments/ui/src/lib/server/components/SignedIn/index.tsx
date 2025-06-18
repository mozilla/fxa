/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Banner, BannerVariant } from '@fxa/payments/ui';

interface SignedInProps {
  email: string;
}

export const SignedIn = ({ email }: SignedInProps) => (
  <Banner variant={BannerVariant.SignedIn}>
    <div
      id="signedin-heading"
      className="break-all font-medium h-5 overflow-auto text-base text-black"
    >
      {email}
    </div>
  </Banner>
);
