import { useRouter } from 'next/router';
import { mockHCMSFetch, Plan, priceDetailsProps } from '../../../../data/mock';

// Generates `/checkout/123` (is the ID set in priceDetailsprops in data/mock)
export async function getStaticPaths() {
  // Add logic to dynamically fetch IDs from hCMS (or for the prototype the mock GraphQL)
  return {
    paths: [{ params: { priceId: priceDetailsProps.priceInfo.id } }],
    fallback: false, // can also be true or 'blocking'
  };
}

export async function getStaticProps() {
  // Add logic here for translations
  // https://soykje.gitlab.io/en/blog/nextjs-i18n/

  // Fetch price config from the hCMS. (Currently mocked out, returning static data)
  const hCmsPriceConfig = await mockHCMSFetch();
  return {
    // Passed to the page component as props
    props: { priceConfig: hCmsPriceConfig },
  };
}

export default function CheckoutSuccessPage({
  priceConfig,
}: {
  priceConfig: Plan;
}) {
  const router = useRouter();
  console.log(router.query);
  return (
    <>
      <p>This is a success page!!!</p>
      <div>{priceConfig.productName}</div>
    </>
  );
}
