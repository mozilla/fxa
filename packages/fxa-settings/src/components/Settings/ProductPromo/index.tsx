/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import LinkExternal from 'fxa-react/components/LinkExternal';
import monitorTextLogo from './monitor-text-logo.svg';
import { FtlMsg } from 'fxa-react/lib/utils';
import classNames from 'classnames';
import { MozServices } from '../../../lib/types';
import { AccountData, useConfig } from '../../../models';
import { constructHrefWithUtm } from '../../../lib/utilities';
import { LINK } from '../../../constants';
import GleanMetrics from '../../../lib/glean';
import { parseAcceptLanguage } from '../../../../../../libs/shared/l10n/src';

type ProductPromoType = 'sidebar' | 'settings';

export interface ProductPromoProps {
  type?: ProductPromoType;
  monitorPromo: MonitorPromoData;
}

export type MonitorPromoData = {
  hidePromo?: boolean;
  showMonitorPlusPromo?: boolean;
  gleanEvent?: { event: { reason: string } };
};

/**
 * Determine which (if any) promo variant to show.
 *
 *   • Paid subscribers see nothing.
 *   • US‑based *Monitor‑free* users see a *special* bundled
 *     promo for Monitor Plus + VPN + Relay.
 *   • All others see the generic promo.
 */
export function getProductPromoData(
  attachedClients: AccountData['attachedClients'],
  subscriptions: AccountData['subscriptions'],
  monitorPlusPromoEligible = false
) {
  const hasMonitor = attachedClients.some(
    ({ name }) => name === MozServices.Monitor || name === MozServices.MonitorStage
  );

  const hasMonitorPlus = subscriptions.some(
    ({ productName }) => productName === MozServices.MonitorPlus
  );

  // Paid users never see a promo at all.
  if (hasMonitorPlus) {
    return { hidePromo: true } as const;
  }

  // Decide whether to surface the special US‑only promo.
  const showMonitorPlusPromo = hasMonitor && monitorPlusPromoEligible;

  const gleanEvent = showMonitorPlusPromo
    ? { event: { reason: 'special' } }
    : { event: { reason: 'default' } };

  return { hidePromo: false, showMonitorPlusPromo, gleanEvent };
}

export const ProductPromo = ({
  type = 'sidebar',
  monitorPromo,
}: ProductPromoProps) => {
  const { sentry } = useConfig();

  // Paid Monitor Plus subscribers never see a promo.
  if (monitorPromo.hidePromo) {
    return null;
  }

  const DEFAULT_PROMO_URL = constructHrefWithUtm(
    // using sentry.env because it differentiates between 'dev', 'stage' and 'prod'
    // (vs 'env' which marks all hosted environments as 'production')
    sentry.env !== 'stage' ? LINK.MONITOR : LINK.MONITOR_STAGE,
    'referral',
    'moz-account',
    type === 'sidebar' ? 'sidebar' : 'settings',
    'get-free-scan-global',
    'settings-promo'
  );

  const SPECIAL_PROMO_URL = constructHrefWithUtm(
    sentry.env !== 'stage' ? LINK.MONITOR_PLUS : LINK.MONITOR_PLUS_STAGE,
    'referral',
    'moz-account',
    type === 'sidebar' ? 'sidebar' : 'settings',
    'get-year-round-protection-us',
    'settings-promo'
  );

  const price = 8.25;
  const formattedLocalizedPrice = new Intl.NumberFormat(
    parseAcceptLanguage(navigator.languages.join(', ')),
    {
      style: 'currency',
      currency: 'USD',
    }
  ).format(price);

  const promoContent = monitorPromo.showMonitorPlusPromo ? (
    <>
      <FtlMsg
        id="product-promo-monitor-special-promo-description"
        vars={{ price: formattedLocalizedPrice }}
      >
        {/* Price in fallback is always in English formatting */}
        <p className="my-2">
          For{' '}
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(price)}
          /mo, save on VPN, Monitor’s data-broker protection, and Relay’s
          unlimited email masks.
        </p>
      </FtlMsg>

      <LinkExternal
        href={SPECIAL_PROMO_URL}
        className="link-blue"
        gleanDataAttrs={{
          id: 'account_pref_promo_monitor_submit',
          type: 'special',
        }}
        onClick={() =>
          GleanMetrics.accountPref.promoMonitorSubmit(monitorPromo.gleanEvent)
        }
      >
        <FtlMsg id="product-promo-monitor-special-promo-cta">
          Get year-round protection
        </FtlMsg>
      </LinkExternal>
    </>
  ) : (
    <>
      <p className="my-2">
        <FtlMsg id="product-promo-monitor-description-v2">
          Find where your private info is exposed and take control
        </FtlMsg>
      </p>
      <LinkExternal
        href={DEFAULT_PROMO_URL}
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
