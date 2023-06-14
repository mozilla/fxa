import {
  ApolloWrapper,
  CouponForm,
  fetchGraphQl,
  CouponFormServer,
  fetchCartById,
  fetchPlans,
} from '@fxa/payments-ui';
import { TermsAndPrivacy } from '@fxa/payments-ui/server';

/* eslint-disable-next-line */
interface DemoProps {
  params: {
    offering: string;
  };
  searchParams: {
    cartId?: string;
  };
}

export default async function Demo({ params, searchParams }: DemoProps) {
  const { offering } = params;
  const { cartId: queryCartId } = searchParams;
  const cartId = queryCartId ? parseInt(queryCartId) : 1;
  const {
    singleCart: { paymentProvider },
  } = await fetchCartById(cartId);

  await fetchPlans();

  return (
    <div>
      <h1 className="text-center text-2xl">Welcome to the Demo Page!</h1>
      <div className="demo-container">
        <h2 className="demo-container-header">Example of a Client Component</h2>
        <div className="w-[480px]">
          <ApolloWrapper>
            <CouponForm cartId={cartId} readOnly={false} />
          </ApolloWrapper>
        </div>
      </div>
      <div className="demo-container">
        <h2 className="demo-container-header">Example of a Server Component</h2>
        {/* @ts-expect-error Server Component */}
        <TermsAndPrivacy
          offering={offering}
          paymentProvider={paymentProvider || 'not_chosen'}
          showFXALinks={true}
        />
      </div>
      <div className="demo-container">
        <h2 className="demo-container-header">Example of a Server Action</h2>
        <div className="w-[480px]">
          {/* @ts-expect-error Server Component */}
          <CouponFormServer cartId={cartId} readOnly={false} />
        </div>
      </div>
    </div>
  );
}
