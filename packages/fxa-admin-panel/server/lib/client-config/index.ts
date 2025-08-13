/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import config from '../../config';
import {
  IClientConfig,
  IncomingAdminPanelHttpHeaders,
} from '../../../interfaces';
import {
  USER_EMAIL_HEADER,
  USER_GROUP_HEADER,
  SERVER_CONFIG_PLACEHOLDER,
} from '../../../constants';
import { AdminPanelEnv, AdminPanelGuard } from 'fxa-shared/guards';
import log from '../logging';
import version from '../version';

const guard = new AdminPanelGuard(config.get('guard.env') as AdminPanelEnv);

/** Client Config Defaults provided by env */
const defaultConfig: IClientConfig = {
  env: config.get('env'),
  version: version?.version,
  guard,
  user: {
    group: guard.getBestGroup(config.get('user.group')),
    email: config.get('user.email'),
  },
  servers: {
    admin: {
      url: config.get('servers.admin.url'),
    },
  },
  sentry: {
    dsn: config.get('sentry.dsn'),
    env: config.get('sentry.env'),
    sampleRate: config.get('sentry.sampleRate'),
    serverName: config.get('sentry.serverName'),
    clientName: config.get('sentry.clientName'),
  },
};

const logger = log('server.client-config');

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
    // Only update state if header is actually defined. In non development environments,
    // the headers are required and will be defined.
    const clone = Object.assign({}, baseConfig);

    const userEmailHeader = headers[USER_EMAIL_HEADER];
    if (userEmailHeader != null) {
      clone.user.email = userEmailHeader;
    }

    const userGroupHeader = headers[USER_GROUP_HEADER];
    if (userGroupHeader != null) {
      clone.user.group = guard.getBestGroup(userGroupHeader);
      logger.info('userGroupHeader', {
        'userGroupHeader.notnull': userGroupHeader,
      });
    }
    logger.info('userGroupHeader', { userGroupHeader: userGroupHeader });
    logger.info('userGroupHeader', { header: JSON.stringify(headers) });
    return clone;
  }
}
