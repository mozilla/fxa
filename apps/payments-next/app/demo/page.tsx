import { ApolloWrapper, CouponForm, fetchGraphQl } from '@fxa/payments-ui';
import { TermsAndPrivacy } from '@fxa/payments-ui/server';

const CART_QUERY = `
  query singleCart($input: SingleCartInput!) {
    singleCart(input: $input) {
      id
      promotionCode
      paymentProvider
    }
  }
`;

/* eslint-disable-next-line */
interface DemoProps {}

export default async function Demo(props: DemoProps) {
  const {
    singleCart: { paymentProvider },
  } = await fetchGraphQl(CART_QUERY, {
    input: { id: 1 },
  });

  return (
    <div>
      <h1>Welcome to the Demo Page!</h1>
      <div className="w-[480px]">
        <h2>Example of a Client Component</h2>
        <ApolloWrapper>
          <CouponForm cartId={1} readOnly={false} />
        </ApolloWrapper>
      </div>
      <>
        <h2>Example of a Server Component</h2>
        {/* @ts-expect-error Server Component */}
        <TermsAndPrivacy
          paymentProvider={paymentProvider || 'not_chosen'}
          showFXALinks={true}
        />
      </>
    </div>
  );
}
