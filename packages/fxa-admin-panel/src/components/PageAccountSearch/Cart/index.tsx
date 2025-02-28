/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Cart as CartType } from 'fxa-admin-server/src/graphql';
import { TableRowYHeader, TableYHeaders } from '../../TableYHeaders';

export type CartsProps = { cart: CartType };

export const Cart = ({ cart }: CartsProps) => {
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
      <TableRowYHeader header="Version" children={cart.version.toString()} />
      <TableRowYHeader
        header="Eligibility Status"
        children={cart.eligibilityStatus}
      />
      <TableRowYHeader header="Email" children={cart.email ?? ''} />
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
