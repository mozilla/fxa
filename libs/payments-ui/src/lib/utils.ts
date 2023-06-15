import { cache } from 'react';
import { CART_QUERY_STRING } from './graphql';
import { PaymentProvider } from './terms-and-privacy/utils';
/**
 * DEMO IMPLEMENTATION ONLY
 * This was thrown together to make the demo work
 * Do Not Review
 */
export function getConfig() {
  return {
    contentServerURL: 'https://accounts.stage.mozaws.net',
  };
}

export const fetchCartByIdWithCache = cache(async (cartId: number) => {
  console.log('Called here actually');
  const temp = await fetch(
    'http://localhost:9000/v1/oauth/subscriptions/plans'
  );
  return fetchGraphQl(CART_QUERY_STRING, {
    input: { id: cartId },
  });
});

export const fetchCartById = async (cartId: number) => {
  return fetchGraphQl(CART_QUERY_STRING, {
    input: { id: cartId },
  });
};

export async function fetchGraphQl(
  query: string,
  variables: any,
  forceCache: boolean = false // Currently not caching any requests by default
) {
  try {
    const result = await fetch('http://localhost:8290/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        query,
        variables,
      }),
      cache: forceCache ? 'force-cache' : 'no-store',
    });

    const { errors, data } = await result.json();

    if (errors) {
      throw new Error(errors[0].message);
    }

    return data;
  } catch (err) {
    console.error(err);
  }
}
