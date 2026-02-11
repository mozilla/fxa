/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createContext, useContext } from 'react';
import { IUserInfo } from '../../interfaces';
import { defaultUser } from '../lib/config';

export interface IUserContext {
  user: IUserInfo;
  setUser: (user: IUserInfo) => void;
}

let _user = defaultUser();
export const UserContext = createContext<IUserContext>({
  user: _user,
  setUser: (user: IUserInfo) => {
    _user = user;
  },
});

export const useUserContext = () => useContext(UserContext);
