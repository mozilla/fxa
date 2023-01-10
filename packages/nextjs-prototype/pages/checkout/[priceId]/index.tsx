import React from 'react';
import { useRouter } from 'next/router';

export default function CheckoutPricePage() {
  const router = useRouter();
  const priceId = router.query.priceId;
  return (
    <>
      <h1>Checkout Page for a specific price</h1>
      <p>This Price has ID: {priceId}</p>
    </>
  );
}
