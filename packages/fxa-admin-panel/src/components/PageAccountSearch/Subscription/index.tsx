/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { MozSubscription } from 'fxa-admin-server/src/graphql';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { HIDE_ROW } from '../../../../constants';
import { ReactComponent as IconExternalLink } from '../../../images/icon-external-link.svg';
import { getFormattedDate } from '../../../lib/utils';
import ResultBoolean from '../../ResultBoolean';
import { TableRowYHeader, TableYHeaders } from '../../TableYHeaders';

const Subscription = ({
  created,
  currentPeriodEnd,
  currentPeriodStart,
  cancelAtPeriodEnd,
  endedAt,
  latestInvoice,
  manageSubscriptionLink,
  planId,
  productName,
  productId,
  status,
  subscriptionId,
}: MozSubscription) => (
  <TableYHeaders>
    <TableRowYHeader header="Product name" children={productName} />
    <TableRowYHeader header="Status" children={status} />
    <TableRowYHeader header="Created at" children={getFormattedDate(created)} />
    <TableRowYHeader
      header="Ended at"
      children={endedAt ? getFormattedDate(endedAt) : HIDE_ROW}
    />
    <TableRowYHeader
      header="Current period start"
      children={getFormattedDate(currentPeriodStart)}
    />
    <TableRowYHeader
      header="Current period end"
      children={getFormattedDate(currentPeriodEnd)}
    />
    <TableRowYHeader
      header="Cancel at period end"
      children={<ResultBoolean isTruthy={cancelAtPeriodEnd} format={false} />}
    />

    <TableRowYHeader header="Subscription ID" children={subscriptionId} />
    <TableRowYHeader header="Product ID" children={productId} />
    <TableRowYHeader header="Plan ID" children={planId} />

    <TableRowYHeader
      header="Links"
      children={
        <>
          {!!latestInvoice && (
            <LinkExternal href={latestInvoice} className="underline block">
              Latest invoice
              <IconExternalLink className="ml-2 w-4 inline-block icon-dark" />
            </LinkExternal>
          )}

          {!!manageSubscriptionLink && (
            <LinkExternal
              href={manageSubscriptionLink}
              className="underline block"
            >
              Manage Subscription
              <IconExternalLink className="ml-2 w-4 inline-block icon-dark" />
            </LinkExternal>
          )}
        </>
      }
    />
  </TableYHeaders>
);

export default Subscription;
