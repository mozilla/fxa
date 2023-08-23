/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
/**
 * Additional associated types for kysley db types.
 */
import { Insertable, Selectable, Updateable } from 'kysely';

import { Accounts, Carts } from './keysley-types';

export type Account = Selectable<Accounts>;
export type NewAccount = Insertable<Accounts>;
export type AccountUpdate = Updateable<Accounts>;

export type Cart = Selectable<Carts>;
export type NewCart = Insertable<Carts>;
export type CartUpdate = Updateable<Carts>;
