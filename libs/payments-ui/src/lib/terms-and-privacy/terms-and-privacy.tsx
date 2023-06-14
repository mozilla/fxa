import { fetchCartById, fetchGraphQl, getConfig } from '../utils';
import {
  GenericTermItem,
  GenericTermsListItem,
  PaymentProvider,
  buildFirefoxAccountsTerms,
  buildPaymentTerms,
  buildProductTerms,
  getTermsCMS,
} from './utils';

/**
 * GENERAL COMMENTS
 *  - Example of a Container/Presentation pattern
 *    - Container: TermsAndPrivacy
 *    - Presentation: GenericTerms
 *  - The idea behind this pattern is to keep the component logic, performed in the container, and
 *    presentation separate. This creates a neat separation of code that determines what is shown,
 *    and then separately how it's shown.
 */

/**
 * COMMENTS - GenericTerms component - Presentation component
 *  - An example of a presentation component
 *    - Return only data passed in via props
 *    - Presentation components should not be exported
 *  - Note that this component could be split out into a seperate GenericTerm, when iterrating
 *    over the individual Terms in `items.map`. Conversly, this GenericTerms component could
 *    be merged entirely into the TermsAndPrivacy component. When to split or merge components
 *    is left up to engineer, however tend towards the following.
 *      - Fewer components overall
 *      - Split up components into container/presentation components when it improves readability
 *        and understanding
 *  - TODO: Translation for React Server Components (RSC) and Server Side Rendering (SSR)
 */

type GenericTermsProps = {
  title: string;
  titleLocalizationId: string;
  items: GenericTermsListItem[];
};

function GenericTerms({
  title,
  titleLocalizationId,
  items,
}: GenericTermsProps) {
  return (
    <div className="clear-both mt-5 text-xs leading-5 text-center">
      <p className="m-0 font-semibold text-grey-500">{title}</p>

      <p className="m-0 text-grey-400">
        {items.map((item) => (
          <span key={`span-${item.key}`} className="mr-3 last:mr-0">
            <a key={`link-${item.key}`} href={item.href} target="_blank">
              {item.text}
              <span className="sr-only">Opens in new window</span>
            </a>
          </span>
        ))}
      </p>
    </div>
  );
}

/**
 * COMMENTS - TermsAndPrivacy component - Container component
 *  - An example container component
 *    - Handle all controller logic, data fetching etc, and pass the necessary
 *      information to the presentation components.
 *  - Data Fetching (WIP - These points are based on current understanding)
 *    - Cacheable requests should be fetched by the Component (TODO - Find docs for this)
 *      - Example => CMS data fetch, since it's the same for all customers
 *    - Non-cacheable data should be passed in as props (TODO - Find docs for this)
 *      - Example => Cart data, different for each CartId, in this case paymentProvider
 *
 * Regarding data fetching, this is from the Next.js docs
 *  - https://nextjs.org/docs/app/building-your-application/data-fetching/fetching
 *  - Whenever possible, it's best to fetch data in the segment that uses it. This also allows
 *    you to show a loading state for only the part of the page that is loading, and not the entire page.
 */

export interface TermsAndPrivacyProps {
  offering: string;
  paymentProvider?: PaymentProvider;
  showFXALinks?: boolean;
}

export async function TermsAndPrivacy({
  offering,
  paymentProvider,
  showFXALinks = false,
}: TermsAndPrivacyProps) {
  const { contentServerURL } = getConfig();

  const termsCms = await getTermsCMS(offering);
  const data = await fetchCartById(1);

  if (!termsCms) {
    return (
      <>
        <h3>Error</h3>
        <p>Please reload page</p>
      </>
    );
  }

  const { productName, termsOfService, termsOfServiceDownload, privacyNotice } =
    termsCms;

  const terms: GenericTermItem[] = [
    ...buildPaymentTerms(paymentProvider),
    ...buildFirefoxAccountsTerms(showFXALinks, contentServerURL),
    ...buildProductTerms(
      productName,
      termsOfService,
      privacyNotice,
      termsOfServiceDownload
    ),
  ];

  return (
    <>
      {terms.map((term) => (
        <GenericTerms {...term} key={term.key} />
      ))}
    </>
  );
}

export default TermsAndPrivacy;
