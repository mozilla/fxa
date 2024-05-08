/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Localized, LocalizedProps } from '@fluent/react';

export type FtlMsgProps = {
  children: React.ReactNode;
} & LocalizedProps;

export const FtlMsg = (props: FtlMsgProps) => (
  <Localized {...props}>{props.children}</Localized>
);
