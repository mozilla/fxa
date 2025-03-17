/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Cart as CartType } from 'fxa-admin-server/src/graphql';
import { TableRowYHeader, TableYHeaders } from '../../TableYHeaders';

export type CartsProps = { carts?: Nullable<CartType[]> };

export const Carts = ({ carts }: CartsProps) => {
  if (carts && carts.length > 0) {
    const cartTables = (
      <>
        {carts.map((cart) => (
          <Cart cart={cart} />
        ))}
      </>
    );

    if (carts.length > 1) {
      return (
        <details>
          <summary className="hover:cursor-pointer text-violet-900 font-semibold mb-4">
            Toggle viewing {carts.length} carts
          </summary>
          {cartTables}
        </details>
      );
    }
    return cartTables;
  }

  return <p className="result-none">This account doesn't have any carts.</p>;
};

export type CartProps = { cart: CartType };

export const Cart = ({ cart }: CartProps) => {
  return (
    <TableYHeaders>
      <TableRowYHeader header="Cart ID" children={cart.id} />
      <TableRowYHeader header="FxA User ID" children={cart.uid ?? ''} />
      <TableRowYHeader header="State" children={cart.state} />
      <TableRowYHeader
        header="Error Reason ID"
        children={cart.errorReasonId ?? ''}
      />
      <TableRowYHeader header="Offering" children={cart.offeringConfigId} />
      <TableRowYHeader header="Interval" children={cart.interval} />
      <TableRowYHeader header="Experiment" children={cart.experiment ?? ''} />
      <TableRowYHeader header="Currency" children={cart.currency ?? ''} />
      <TableRowYHeader
        header="Amount (smallest-fraction units, e.g. cents)"
        children={cart.amount.toString() ?? ''}
      />
      <TableRowYHeader
        header="Created"
        children={new Date(cart.createdAt).toLocaleString()}
      />
      <TableRowYHeader
        header="Updated"
        children={new Date(cart.updatedAt).toLocaleString()}
      />
      <TableRowYHeader
        header="Version (cart update count)"
        children={cart.version.toString()}
      />
      <TableRowYHeader
        header="Eligibility Status"
        children={cart.eligibilityStatus}
      />
      <TableRowYHeader
        header="Tax Address: Country Code"
        children={cart.taxAddress?.countryCode ?? ''}
      />
      <TableRowYHeader
        header="Tax Address: Postal Code"
        children={cart.taxAddress?.postalCode ?? ''}
      />
      <TableRowYHeader header="Coupon Code" children={cart.couponCode ?? ''} />
      <TableRowYHeader
        header="Stripe Customer ID"
        children={cart.stripeCustomerId ?? ''}
      />
      <TableRowYHeader
        header="Stripe Subscription ID"
        children={cart.stripeSubscriptionId ?? ''}
      />
    </TableYHeaders>
  );
};
