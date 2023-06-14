'use server';

import { CART_QUERY_STRING, CHECK_CODE_STRING } from './graphql';
import { fetchGraphQl } from './utils';
import { redirect } from 'next/navigation';

export async function addItem(data: FormData) {
  const promotionCode = data.get('coupon');
  const cartId = 1;

  await fetchGraphQl(
    CHECK_CODE_STRING,
    {
      input: {
        id: cartId,
        promotionCode,
      },
    },
    true
  );

  redirect(`/vpn/demo?id=${cartId}`);
}
