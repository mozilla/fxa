import { FluentBundle } from '@fluent/bundle';
import { getBundle } from '@fxa/shared/l10n';
import {
  GenericTermItem,
  GenericTermsListItem,
  PaymentProvider,
  buildFirefoxAccountsTerms,
  buildPaymentTerms,
  buildProductTerms,
} from '../utils/terms-and-privacy';

const CONTENT_SERVER_URL = 'https://accounts.stage.mozaws.net'; // TODO - Get from config once FXA-7503 lands

type GenericTermsProps = {
  title: string;
  titleId: string;
  titleLocalizationId: string;
  items: GenericTermsListItem[];
  l10n: FluentBundle;
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
      <h4 className="m-0 font-semibold text-grey-400" id={titleId}>
        {l10n.getMessage(titleLocalizationId)?.value?.toString() || title}
      </h4>

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
              {l10n.getMessage(item.localizationId)?.value?.toString() ||
                item.text}
              <span className="sr-only">Opens in new window</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export interface TermsAndPrivacyProps {
  locale: string;
  paymentProvider?: PaymentProvider;
  productName: string;
  termsOfServiceUrl: string;
  termsOfServiceDownloadUrl: string;
  privacyNoticeUrl: string;
  showFXALinks?: boolean;
}

export async function TermsAndPrivacy({
  locale,
  paymentProvider,
  productName,
  termsOfServiceUrl,
  termsOfServiceDownloadUrl,
  privacyNoticeUrl,
  showFXALinks = false,
}: TermsAndPrivacyProps) {
  const contentServerURL = CONTENT_SERVER_URL;

  const terms: GenericTermItem[] = [
    ...buildPaymentTerms(paymentProvider),
    ...buildFirefoxAccountsTerms(showFXALinks, contentServerURL),
    ...buildProductTerms(
      productName,
      termsOfServiceUrl,
      privacyNoticeUrl,
      termsOfServiceDownloadUrl
    ),
  ];

  // TODO
  // Move to instantiation on start up. Ideally getBundle's, generateBundle, is only called once at startup,
  // and then that instance is used for all requests.
  // Approach 1 (Experimental): https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
  // Approach 2 (Node global): https://github.com/vercel/next.js/blob/canary/examples/with-knex/knex/index.js#L13
  const l10n = await getBundle([locale]);

  return (
    <aside className="pt-14" aria-label="Terms and Privacy Notices">
      {terms.map((term) => (
        <GenericTerms {...term} titleId={term.key} key={term.key} l10n={l10n} />
      ))}
    </aside>
  );
}

export default TermsAndPrivacy;
