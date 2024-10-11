/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import { useEffect, useState } from 'react';
import { WithContextCart } from '@fxa/payments/cart';
import { getCartOrRedirectAction } from '@fxa/payments/ui/actions';
import { SupportedPages } from '@fxa/payments/ui';
import { StripeWrapper } from '../StripeWrapper';
import { CartPoller } from '../CartPoller';

export const PollingSection = ({ cartId }: { cartId: string }) => {
  const [cart, setCart] = useState<WithContextCart | null>(null);
  useEffect(() => {
    getCartOrRedirectAction(cartId, SupportedPages.PROCESSING).then((cart) => {
      setCart(cart);
    });
  }, []);
  if (cart && cart.currency) {
    return (
      <StripeWrapper
        amount={cart.amount}
        currency={cart.currency.toLowerCase()}
      >
        <CartPoller />
      </StripeWrapper>
    );
  } else return <></>;
};
