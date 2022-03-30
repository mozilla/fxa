/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { IncomingHttpHeaders } from 'http';
import { USER_EMAIL_HEADER, USER_GROUP_HEADER } from '../constants';

export interface IPermission {
  name: string;
  enabled: boolean;
}

export interface IUserInfo {
  group: string;
  email: string;
  permissions: Record<string, IPermission>;
}

export interface IServerInfo {
  url: string;
}

export interface IClientConfig {
  env: string;
  user: IUserInfo;
  servers: {
    admin: IServerInfo;
  };
}

export interface IncomingAdminPanelHttpHeaders extends IncomingHttpHeaders {
  [USER_EMAIL_HEADER]?: string | undefined;
  [USER_GROUP_HEADER]?: string | undefined;
}
