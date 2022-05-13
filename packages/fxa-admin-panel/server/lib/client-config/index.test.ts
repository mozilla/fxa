/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ClientConfig } from '.';
import { SERVER_CONFIG_PLACEHOLDER } from '../../../constants';
import { JSDOM } from 'jsdom';
import {
  AdminPanelEnv,
  AdminPanelGroup,
  PermissionLevel,
  USER_EMAIL_HEADER,
  USER_GROUP_HEADER,
} from 'fxa-shared/guards';
import { IUserInfo } from '../../../interfaces';

describe('ClientConfig', () => {
  function configCheck(remoteHeader: string, user: IUserInfo) {
    const html = `<head><meta name="fxa-config" content="${SERVER_CONFIG_PLACEHOLDER}"/></meta></head>`;
    const expectedConfig = Object.assign({}, ClientConfig.defaultConfig, {
      user,
    });
    const injectedHtml = ClientConfig.injectIntoHtml(html, {
      [USER_GROUP_HEADER]: remoteHeader,
      [USER_EMAIL_HEADER]: user.email,
    });

    const injectedVal = JSDOM.fragment(injectedHtml)
      .querySelector('meta[name="fxa-config"]')
      ?.getAttribute('content');

    expect(injectedVal).toBeDefined();
    expect(injectedHtml).not.toEqual(html);
    expect(JSON.parse(decodeURIComponent(injectedVal || ''))).toEqual(
      expectedConfig
    );
  }

  it('provides default config', () => {
    const config = ClientConfig.defaultConfig;
    expect(config).toBeDefined();
  });

  it('injects admin user config into html', () => {
    configCheck(AdminPanelGroup.AdminProd, {
      email: 'hello@mozilla.com',
      group: {
        name: 'Admin',
        header: 'vpn_fxa_admin_panel_prod',
        level: PermissionLevel.Admin,
        env: AdminPanelEnv.Prod,
      },
    });
  });

  it('injects support agent user config into html', () => {
    configCheck(AdminPanelGroup.SupportAgentProd, {
      email: 'hello@mozilla.com',
      group: {
        name: 'Support',
        header: 'vpn_fxa_supportagent_prod',
        level: PermissionLevel.Support,
        env: AdminPanelEnv.Prod,
      },
    });
  });

  it('injects unknown user config into html', () => {
    configCheck(AdminPanelGroup.None, {
      email: 'hello@mozilla.com',
      group: {
        name: 'Unknown',
        header: '',
        level: PermissionLevel.None,
      },
    });
  });

  it('handles noisy remote groups header', () => {
    configCheck('test,test2,vpn_fxa_supportagent_prod,test3', {
      email: 'hello@mozilla.com',
      group: {
        name: 'Support',
        header: AdminPanelGroup.SupportAgentProd,
        level: PermissionLevel.Support,
        env: AdminPanelEnv.Prod,
      },
    });
  });

  it('handles multiple remote group headers', () => {
    configCheck(
      'test,vpn_default,vpn_fxa_admin_panel_prod,vpn_fxa_admin_panel_stage,test',
      {
        email: 'hello@mozilla.com',
        group: {
          name: 'Admin',
          header: AdminPanelGroup.AdminProd,
          level: PermissionLevel.Admin,
          env: AdminPanelEnv.Prod,
        },
      }
    );
  });
});
