/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  GenericTermItem,
  GenericTermsListItem,
  PaymentProvider,
  buildFirefoxAccountsTerms,
  buildPaymentTerms,
  buildProductTerms,
} from '../../../utils/terms-and-privacy';
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
      className="clear-both mt-5 text-xs leading-5 text-center"
      role="group"
      aria-labelledby={titleId}
    >
      <h3 className="m-0 font-semibold text-grey-400" id={titleId}>
        {l10n.getString(titleLocalizationId, title)}
      </h3>

      <ul className="flex justify-center gap-4 m-0 text-grey-500">
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
  paymentProvider?: PaymentProvider;
  productName: string;
  termsOfServiceUrl: string;
  termsOfServiceDownloadUrl: string;
  privacyNoticeUrl: string;
  contentServerUrl: string;
  showFXALinks?: boolean;
}

export async function TermsAndPrivacy({
  l10n,
  paymentProvider,
  productName,
  termsOfServiceUrl,
  termsOfServiceDownloadUrl,
  privacyNoticeUrl,
  contentServerUrl,
  showFXALinks = false,
}: TermsAndPrivacyProps) {
  const terms: GenericTermItem[] = [
    ...buildPaymentTerms(paymentProvider),
    ...buildFirefoxAccountsTerms(showFXALinks, contentServerUrl),
    ...buildProductTerms(
      productName,
      termsOfServiceUrl,
      privacyNoticeUrl,
      termsOfServiceDownloadUrl
    ),
  ];

  return (
    <aside className="pt-14" aria-label="Terms and Privacy Notices">
      {terms.map((term) => (
        <GenericTerms {...term} titleId={term.key} key={term.key} l10n={l10n} />
      ))}
    </aside>
  );
}

export default TermsAndPrivacy;
