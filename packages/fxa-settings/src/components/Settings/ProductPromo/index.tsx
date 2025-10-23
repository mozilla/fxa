/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import classNames from 'classnames';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { FtlMsg } from 'fxa-react/lib/utils';
import { LINK } from '../../../constants';
import GleanMetrics from '../../../lib/glean';
import { MozServices } from '../../../lib/types';
import { constructHrefWithUtm } from '../../../lib/utilities';
import { AccountData, useConfig } from '../../../models';
import monitorTextLogo from './monitor-text-logo.svg';

type ProductPromoType = 'sidebar' | 'settings';

export interface ProductPromoProps {
  type?: ProductPromoType;
  monitorPromo: MonitorPromoData;
}

export type MonitorPromoData = {
  hidePromo?: boolean;
  gleanEvent?: { event: { reason: string } };
};

export function getProductPromoData(
  attachedClients: AccountData['attachedClients']
) {
  const hasMonitor = attachedClients.some(
    ({ name }) =>
      name === MozServices.Monitor || name === MozServices.MonitorStage
  );

  // Existing Monitor users should not see the promo
  if (hasMonitor) {
    return { hidePromo: true } as const;
  }

  const gleanEvent = { event: { reason: 'default' } };

  return { hidePromo: false, gleanEvent };
}

export const ProductPromo = ({
  type = 'sidebar',
  monitorPromo,
}: ProductPromoProps) => {
  const { sentry } = useConfig();

  if (monitorPromo.hidePromo) {
    return null;
  }

  const MONITOR_PROMO_URL = constructHrefWithUtm(
    // using sentry.env because it differentiates between 'dev', 'stage' and 'prod'
    // (vs 'env' which marks all hosted environments as 'production')
    sentry.env !== 'stage' ? LINK.MONITOR : LINK.MONITOR_STAGE,
    'referral',
    'moz-account',
    type === 'sidebar' ? 'sidebar' : 'settings',
    'get-free-scan-global',
    'settings-promo'
  );

  const promoContent = (
    <>
      <p className="my-2">
        <FtlMsg id="product-promo-monitor-description-v2">
          Find where your private info is exposed and take control
        </FtlMsg>
      </p>
      <LinkExternal
        href={MONITOR_PROMO_URL}
        className="link-blue"
        gleanDataAttrs={{
          id: 'account_pref_promo_monitor_submit',
          type: 'default',
        }}
        onClick={() =>
          GleanMetrics.accountPref.promoMonitorSubmit(monitorPromo.gleanEvent)
        }
      >
        <FtlMsg id="product-promo-monitor-cta">Get free scan</FtlMsg>
      </LinkExternal>
    </>
  );

  return (
    <aside
      className={classNames(
        'bg-white rounded-lg desktop:w-11/12 desktop:max-w-56 desktop:p-4 desktop:pb-6 text-grey-600 text-md desktop:text-sm text-start',
        type === 'sidebar' &&
          'hidden desktop:block px-6 mt-4 desktop:mt-20 desktop:max-w-80 desktop:w-11/12',
        type === 'settings' && 'desktop:hidden px-5 py-3 mb-16'
      )}
    >
      <div
        className={classNames(
          type === 'sidebar' &&
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
        {promoContent}
      </div>
    </aside>
  );
};
export default ProductPromo;
