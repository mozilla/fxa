/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import config from '../../config';
import {
  IClientConfig,
  IUserInfo,
  IncomingAdminPanelHttpHeaders,
} from '../../../interfaces';
import {
  USER_EMAIL_HEADER,
  USER_GROUP_HEADER,
  SERVER_CONFIG_PLACEHOLDER,
} from '../../../constants';

/** Client Config Defaults provided by env */
const defaultConfig: IClientConfig = {
  env: config.get('env'),
  user: {
    group: config.get('user.group'),
    email: config.get('user.email'),
    permissions: {},
  },
  servers: {
    admin: {
      url: config.get('servers.admin.url'),
    },
  },
};

/** Utility class providing functionality for dealing with generation of client side configuration. */
export class ClientConfig {
  static get defaultConfig() {
    return defaultConfig;
  }

  /** Adds an encoded config to the provided html. */
  static injectIntoHtml(html: string, headers: IncomingAdminPanelHttpHeaders) {
    const config = this.update(defaultConfig, headers);
    return this.injectMetaContent(html, {
      [SERVER_CONFIG_PLACEHOLDER]: config,
    });
  }

  private static injectMetaContent(
    html: string,
    metaContent: { [x: string]: any }
  ) {
    let result = html;

    Object.keys(metaContent).forEach((k) => {
      result = result.replace(
        k,
        encodeURIComponent(JSON.stringify(metaContent[k]))
      );
    });

    return result;
  }

  /** Provides a customized config object that takes state of http headers into account. */
  private static update(
    baseConfig: IClientConfig,
    headers: IncomingAdminPanelHttpHeaders
  ) {
    const user = this.getUserFromHeader(headers, baseConfig.user);
    const merged = this.mergeConfig(baseConfig, { user });
    return merged;
  }

  private static getUserFromHeader(
    headers: IncomingAdminPanelHttpHeaders,
    user: IUserInfo
  ) {
    user.email = headers[USER_EMAIL_HEADER] || user.email;
    user.group = headers[USER_GROUP_HEADER] || user.group;
    return user;
  }

  private static mergeConfig(c1: IClientConfig, c2: Partial<IClientConfig>) {
    return Object.assign({}, c1, c2);
  }
}
