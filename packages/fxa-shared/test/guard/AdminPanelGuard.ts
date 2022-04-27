/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  guard,
  AdminPanelFeature,
  AdminPanelGroup,
  PermissionLevel,
} from '../../guards';
import { expect } from 'chai';

describe('support agents', () => {
  describe('Admin Panel Guard', () => {
    it('allows', () => {
      expect(
        guard.allow(AdminPanelFeature.DisableAccount, AdminPanelGroup.AdminProd)
      ).true;
    });

    it('looks up group', () => {
      expect(guard.getGroup(AdminPanelGroup.AdminProd)).deep.equal({
        name: 'Admin',
        header: 'vpn_fxa_admin_panel_prod',
        level: PermissionLevel.Admin,
      });
      expect(guard.getGroup(AdminPanelGroup.AdminStage)).deep.equal({
        name: 'Admin',
        header: 'vpn_fxa_admin_panel_stage',
        level: PermissionLevel.Admin,
      });
      expect(guard.getGroup(AdminPanelGroup.SupportAgentProd)).deep.equal({
        name: 'Support',
        header: 'vpn_fxa_supportagent_prod',
        level: PermissionLevel.Support,
      });
      expect(guard.getGroup(AdminPanelGroup.SupportAgentStage)).deep.equal({
        name: 'Support',
        header: 'vpn_fxa_supportagent_stage',
        level: PermissionLevel.Support,
      });
    });

    it('denies', () => {
      expect(
        guard.allow(
          AdminPanelFeature.DisableAccount,
          AdminPanelGroup.SupportAgentStage
        )
      ).false;
    });

    it('gets feature', () => {
      expect(guard.getFeature(AdminPanelFeature.AccountSearch)).deep.equal({
        name: 'Lookup Account By Email/UID',
        level: PermissionLevel.Support,
      });
    });
  });
});
