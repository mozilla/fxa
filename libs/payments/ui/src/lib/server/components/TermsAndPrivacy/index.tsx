/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  GenericTermItem,
  GenericTermsListItem,
  buildFirefoxAccountsTerms,
  buildPaymentTerms,
  buildProductTerms,
} from '../../../utils/terms-and-privacy';
import { PaymentInfo } from '@fxa/payments/cart';
import { LocalizerRsc } from '@fxa/shared/l10n/server';

type GenericTermsProps = {
  title: string;
  titleId: string;
  titleLocalizationId: string;
  items: GenericTermsListItem[];
  l10n: LocalizerRsc;
};

function GenericTerms({
  titleId,
  title,
  titleLocalizationId,
  items,
  l10n,
}: GenericTermsProps) {
  return (
    <div
      className="mt-5 text-xs leading-5 text-center"
      role="group"
      aria-labelledby={titleId}
    >
      <h3 className="m-0 font-semibold text-grey-400" id={titleId}>
        {titleLocalizationId
          ? l10n.getString(titleLocalizationId, title)
          : title}
      </h3>

      <ul className="tablet:flex tablet:justify-center gap-4 m-0 text-grey-500">
        {items.map((item) => (
          <li key={`span-${item.key}`}>
            <a
              key={`link-${item.key}`}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="text-blue-500 underline"
            >
              {l10n.getString(item.localizationId, item.text)}
              <span className="sr-only">Opens in new window</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export interface TermsAndPrivacyProps {
  l10n: LocalizerRsc;
  paymentInfo?: PaymentInfo;
  productName: string;
  termsOfServiceUrl: string;
  termsOfServiceDownloadUrl: string;
  privacyNoticeUrl: string;
  contentServerUrl: string;
  showFXALinks?: boolean;
  hasActiveSubscriptions?: boolean;
}

export async function TermsAndPrivacy({
  l10n,
  paymentInfo,
  productName,
  termsOfServiceUrl,
  termsOfServiceDownloadUrl,
  privacyNoticeUrl,
  contentServerUrl,
  showFXALinks = false,
  hasActiveSubscriptions,
}: TermsAndPrivacyProps) {
  const terms: GenericTermItem[] = [
    ...buildPaymentTerms(paymentInfo, hasActiveSubscriptions),
    ...buildFirefoxAccountsTerms(showFXALinks, contentServerUrl),
    ...buildProductTerms(
      productName,
      termsOfServiceUrl,
      privacyNoticeUrl,
      termsOfServiceDownloadUrl
    ),
  ];

  return (
    <aside aria-label="Terms and Privacy Notices">
      {terms.map((term) => (
        <GenericTerms {...term} titleId={term.key} key={term.key} l10n={l10n} />
      ))}
    </aside>
  );
}

export default TermsAndPrivacy;
