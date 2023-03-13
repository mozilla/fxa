/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useState } from 'react';
import { getSearchParams } from '../../utilities';
import { useLocation } from '@reach/router';
import { LinkStatus } from '../../types';

const getSetLinkStatus = (
  setLinkStatusConditionally: React.Dispatch<React.SetStateAction<LinkStatus>>,
  requiredParams: RequiredParamsAccountRecoveryConfirmKey | null
) => {
  // allow setting of `LinkStatus.damaged` or `LinkStatus.expired`, but confirm all required
  // params are present before allowing a set to `linkStatus.valid`
  return (linkStatus: LinkStatus) => {
    if (linkStatus === LinkStatus.valid) {
      if (requiredParams) {
        setLinkStatusConditionally(LinkStatus.valid);
      }
      // do nothing if requiredParams are not present
    } else {
      setLinkStatusConditionally(linkStatus);
    }
  };
};

// AccountRecoveryConfirmKey
const requiredParamsAccountRecoveryConfirmKey = [
  'email',
  'token',
  'code',
  'uid',
];
type ParamsAccountRecoveryConfirmKey = {
  email: string | null;
  token: string | null;
  code: string | null;
  uid: string | null;
};
export type RequiredParamsAccountRecoveryConfirmKey = {
  [K in keyof ParamsAccountRecoveryConfirmKey]: NonNullable<
    ParamsAccountRecoveryConfirmKey[K]
  >;
};

export function useAccountRecoveryConfirmKeyLinkStatus() {
  const searchParams = getSearchParams(
    requiredParamsAccountRecoveryConfirmKey,
    useLocation().href
  ) as ParamsAccountRecoveryConfirmKey;

  const isValid =
    searchParams &&
    requiredParamsAccountRecoveryConfirmKey.every(
      (key) =>
        typeof searchParams[
          key as keyof RequiredParamsAccountRecoveryConfirmKey
        ] === 'string'
    );

  const requiredParams = isValid
    ? (searchParams as RequiredParamsAccountRecoveryConfirmKey)
    : null;

  const [linkStatus, setLinkStatusConditionally] = useState<LinkStatus>(
    isValid ? LinkStatus.valid : LinkStatus.damaged
  );

  const setLinkStatus = getSetLinkStatus(
    setLinkStatusConditionally,
    requiredParams
  );

  return {
    linkStatus,
    setLinkStatus,
    requiredParams,
  };
}
