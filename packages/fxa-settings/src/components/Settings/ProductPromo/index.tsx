/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import LinkExternal from 'fxa-react/components/LinkExternal';
import monitorTextLogo from './monitor-text-logo.svg';
import { FtlMsg } from 'fxa-react/lib/utils';
import classNames from 'classnames';
import { MonitorLink } from '../../../constants';
import { MozServices } from '../../../lib/types';
import { useAccount } from '../../../models';

export enum ProductPromoType {
  Sidebar = 'sidebar',
  Settings = 'settings',
}

export interface ProductPromoProps {
  type?: ProductPromoType;
  // product?: MozServices;
}

export const ProductPromo = ({
  type = ProductPromoType.Sidebar,
}: ProductPromoProps) => {
  const { attachedClients } = useAccount();

  const hasMonitor = attachedClients.some(
    ({ name }) => name === MozServices.Monitor
  );
  // const hasMonitorPlus = subscriptions.some(
  //   ({ productName }) => productName === MozServices.MonitorPlus
  // );

  if (hasMonitor) {
    return <></>;
  }
  // if (hasMonitor) {
  // Glean view event
  // }
  // if (hasMonitorPlus) {
  // Glean view event
  // }
  return (
    <aside
      className={classNames(
        'bg-white rounded-lg desktop:w-11/12 desktop:max-w-56 desktop:p-4 desktop:pb-6 text-grey-600 text-lg desktop:text-sm text-start',
        type === ProductPromoType.Sidebar &&
          'px-6 mt-4 desktop:mt-20 desktop:max-w-80 desktop:w-11/12',
        type === ProductPromoType.Settings &&
          'desktop:hidden mt-12 px-5 py-3 mb-16'
      )}
    >
      <div
        className={classNames(
          type === ProductPromoType.Sidebar &&
            'border-2 border-grey-100 desktop:border-0 rounded-lg px-5 py-3 desktop:px-0 desktop:py-0'
        )}
      >
        <h2>
          <FtlMsg id="product-promo-monitor">
            <img
              src={monitorTextLogo}
              alt="Mozilla Monitor"
              className="w-52 desktop:w-40 h-auto"
            />
          </FtlMsg>
        </h2>
        <p className="my-2">
          <FtlMsg id="product-promo-monitor-description">
            Find where your private info is exposed — and take it back
          </FtlMsg>
        </p>
        {/* possible todo, link to their stage env in stage? can do with FXA-10147 */}
        <LinkExternal href={MonitorLink} className="link-blue">
          <FtlMsg id="product-promo-monitor-cta">Get free scan</FtlMsg>
        </LinkExternal>
      </div>
    </aside>
  );
};
export default ProductPromo;
