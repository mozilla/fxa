/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import Nav, { NavRefProps } from '../Nav';
import ProductPromo, { VpnPromoData } from '../ProductPromo';

export const SideBar = ({
  profileRef,
  securityRef,
  connectedServicesRef,
  linkedAccountsRef,
  dataCollectionRef,
  vpnPromo,
}: NavRefProps & { vpnPromo?: VpnPromoData | null }) => {
  // top-[7.69rem] allows the sticky nav header to align exactly with first section heading
  return (
    <div className="fixed desktop:sticky desktop:top-[7.69rem] inset-0 bg-white dark:bg-grey-900 desktop:bg-transparent dark:desktop:bg-transparent w-full mt-19 desktop:mt-0">
      <Nav
        {...{
          profileRef,
          securityRef,
          connectedServicesRef,
          linkedAccountsRef,
          dataCollectionRef,
        }}
      />
      {vpnPromo && !vpnPromo.hidePromo && (
        <ProductPromo type="sidebar" {...{ vpnPromo }} />
      )}
    </div>
  );
};

export default SideBar;
