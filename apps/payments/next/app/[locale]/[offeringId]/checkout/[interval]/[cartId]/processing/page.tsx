/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import { LoadingSpinner } from '@fxa/payments/ui';
import { Localized } from '@fluent/react';
import { StripeWrapper, PaymentProcessor } from '@fxa/payments/ui';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCartAction } from '@fxa/payments/ui/actions';
import { WithContextCart } from '@fxa/payments/cart';

export default function ProcessingPage() {
  const { cartId }: { cartId: string } = useParams();
  const [cart, setCart] = useState<WithContextCart | null>(null);
  useEffect(() => {
    getCartAction(cartId).then((cart) => {
      setCart(cart);
    });
  }, []);
  return (
    <section
      className="flex flex-col text-center text-sm"
      data-testid="payment-processing"
    >
      <LoadingSpinner className="w-10 h-10" />
      {cart && cart.currency && (
        <StripeWrapper
          amount={cart.amount}
          currency={cart.currency.toLowerCase()}
        >
          <PaymentProcessor />
        </StripeWrapper>
      )}
      <Localized id="next-payment-processing-message">
        Please wait while we process your payment…
      </Localized>
    </section>
  );
}
