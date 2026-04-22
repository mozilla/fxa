/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { ReactComponent as VpnTextLogo } from './vpn-text-logo.svg';
import { FtlMsg } from 'fxa-react/lib/utils';
import classNames from 'classnames';
import { MozServices } from '../../../lib/types';
import { AccountData, useConfig } from '../../../models';
import { constructHrefWithUtm } from '../../../lib/utilities';
import { LINK } from '../../../constants';
import GleanMetrics from '../../../lib/glean';

type ProductPromoType = 'sidebar' | 'settings';

export interface ProductPromoProps {
  type?: ProductPromoType;
  vpnPromo: VpnPromoData;
}

export type VpnPromoData = {
  hidePromo?: boolean;
};

export function getProductPromoData(
  attachedClients: AccountData['attachedClients']
) {
  const hasVpn = attachedClients.some(
    ({ name }) =>
      name === MozServices.MozillaVPN || name === MozServices.VPNStage
  );

  return { hidePromo: hasVpn };
}

export const ProductPromo = ({
  type = 'sidebar',
  vpnPromo,
}: ProductPromoProps) => {
  const { sentry } = useConfig();

  if (vpnPromo.hidePromo) {
    return null;
  }

  const VPN_PROMO_URL = constructHrefWithUtm(
    // using sentry.env because it differentiates between 'dev', 'stage' and 'prod'
    // (vs 'env' which marks all hosted environments as 'production')
    sentry.env !== 'stage' ? LINK.VPN : LINK.VPN_STAGE,
    'mozilla-websites',
    'moz-account',
    'settings',
    'vpn',
    'settings-promo'
  );

  const promoContent = (
    <>
      <p className="my-2">
        <FtlMsg id="product-promo-vpn-description">
          Discover an added layer of anonymous browsing and protection.
        </FtlMsg>
      </p>
      <LinkExternal
        href={VPN_PROMO_URL}
        className="link-blue"
        gleanDataAttrs={{
          id: 'account_pref_promo_vpn_submit',
          type: 'default',
        }}
        onClick={() => GleanMetrics.accountPref.promoVpnSubmit()}
      >
        <FtlMsg id="product-promo-vpn-cta">Get VPN</FtlMsg>
      </LinkExternal>
    </>
  );

  return (
    <aside
      className={classNames(
        'bg-white dark:bg-grey-700 rounded-lg desktop:w-11/12 desktop:max-w-56 desktop:p-4 desktop:pb-6 text-grey-600 dark:text-grey-300 text-md desktop:text-sm text-start',
        type === 'sidebar' &&
          'hidden desktop:block px-6 mt-4 desktop:mt-20 desktop:max-w-80 desktop:w-11/12',
        type === 'settings' && 'desktop:hidden px-5 py-3 mb-16'
      )}
    >
      <div
        className={classNames(
          type === 'sidebar' &&
            'border-2 border-grey-100 dark:border-grey-600 desktop:border-0 rounded-lg px-5 py-3 desktop:px-0 desktop:py-0'
        )}
      >
        <h2>
          <FtlMsg id="product-promo-vpn">
            <VpnTextLogo
              role="img"
              aria-label="Mozilla VPN"
              className="w-52 desktop:w-40 h-auto text-black dark:text-white"
            />
          </FtlMsg>
        </h2>
        {promoContent}
      </div>
    </aside>
  );
};
export default ProductPromo;
