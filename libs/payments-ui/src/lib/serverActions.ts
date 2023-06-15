'use server';

import {
  CART_QUERY_STRING,
  CHECK_CODE_STRING,
  UPDATE_CART_STRING,
} from './graphql';
import { fetchGraphQl } from './utils';
import { redirect } from 'next/navigation';

export async function checkPromotionCode(
  promotionCode: string,
  cartId: number
) {
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

export async function updateCartPromotionCode(
  promotionCode: string,
  cartId: number
) {
  await fetchGraphQl(
    UPDATE_CART_STRING,
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
