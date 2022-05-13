/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  AdminPanelEnv,
  AdminPanelFeature,
  AdminPanelGroup,
  AdminPanelGuard,
  getGroupsByEnv,
  PermissionLevel,
} from '../../guards';
import { expect } from 'chai';

describe('support agents', () => {
  describe('Admin Panel Guard', () => {
    const guard = new AdminPanelGuard();
    const stageGuard = new AdminPanelGuard(AdminPanelEnv.Stage);
    const prodGuard = new AdminPanelGuard(AdminPanelEnv.Prod);

    it('allows', () => {
      expect(
        guard.allow(AdminPanelFeature.DisableAccount, AdminPanelGroup.AdminProd)
      ).true;
      expect(
        stageGuard.allow(
          AdminPanelFeature.DisableAccount,
          AdminPanelGroup.AdminStage
        )
      ).true;
      expect(
        prodGuard.allow(
          AdminPanelFeature.DisableAccount,
          AdminPanelGroup.AdminProd
        )
      ).true;
    });

    it('looks up group', () => {
      expect(guard.getGroup(AdminPanelGroup.AdminProd)).deep.equal({
        name: 'Admin',
        header: 'vpn_fxa_admin_panel_prod',
        level: PermissionLevel.Admin,
        env: AdminPanelEnv.Prod,
      });
      expect(guard.getGroup(AdminPanelGroup.AdminStage)).deep.equal({
        name: 'Admin',
        header: 'vpn_fxa_admin_panel_stage',
        level: PermissionLevel.Admin,
        env: AdminPanelEnv.Stage,
      });
      expect(guard.getGroup(AdminPanelGroup.SupportAgentProd)).deep.equal({
        name: 'Support',
        header: 'vpn_fxa_supportagent_prod',
        level: PermissionLevel.Support,
        env: AdminPanelEnv.Prod,
      });
      expect(guard.getGroup(AdminPanelGroup.SupportAgentStage)).deep.equal({
        name: 'Support',
        header: 'vpn_fxa_supportagent_stage',
        level: PermissionLevel.Support,
        env: AdminPanelEnv.Stage,
      });
    });

    it('looks up best group', () => {
      expect(
        guard.getBestGroup(
          `${AdminPanelGroup.AdminProd},${AdminPanelGroup.AdminStage},${AdminPanelGroup.SupportAgentProd},${AdminPanelGroup.None}`
        )
      ).deep.equal(
        guard.getGroup(AdminPanelGroup.AdminProd),
        'production group should take precedence'
      );

      expect(
        guard.getBestGroup(
          `${AdminPanelGroup.AdminStage},${AdminPanelGroup.SupportAgentProd},${AdminPanelGroup.AdminProd},${AdminPanelGroup.None}`
        )
      ).deep.equal(
        guard.getGroup(AdminPanelGroup.AdminProd),
        'production group should take precedence, order should not matter'
      );

      expect(
        stageGuard.getBestGroup(
          `${AdminPanelGroup.AdminProd},${AdminPanelGroup.SupportAgentStage}`
        )
      ).deep.equal(
        guard.getGroup(AdminPanelGroup.SupportAgentStage),
        'only stage groups should be considered'
      );

      expect(
        stageGuard.getBestGroup(
          `${AdminPanelGroup.AdminStage},${AdminPanelGroup.AdminProd}`
        )
      ).deep.equal(
        guard.getGroup(AdminPanelGroup.AdminStage),
        'only stage groups should be considered'
      );

      expect(
        prodGuard.getBestGroup(
          `${AdminPanelGroup.AdminStage},${AdminPanelGroup.AdminProd}`
        )
      ).deep.equal(
        guard.getGroup(AdminPanelGroup.AdminProd),
        'only production groups should be considered'
      );

      expect(
        guard.getBestGroup(
          `test1, ${AdminPanelGroup.SupportAgentProd}, test2 , ${AdminPanelGroup.AdminProd}, test3`
        )
      ).deep.equal(
        guard.getGroup(AdminPanelGroup.AdminProd),
        'irrelevant and whitespace groups should have no effect'
      );
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

    it('gets groups', () => {
      const groups = getGroupsByEnv();
      expect(groups[AdminPanelGroup.AdminProd]).to.exist;
      expect(groups[AdminPanelGroup.SupportAgentProd]).to.exist;
      expect(groups[AdminPanelGroup.AdminStage]).to.exist;
      expect(groups[AdminPanelGroup.SupportAgentStage]).to.exist;
      expect(groups[AdminPanelGroup.None]).to.exist;
    });

    it('throws on invalid group', () => {
      expect(() => stageGuard.getGroup(AdminPanelGroup.AdminProd)).throws(
        `Unknown group ${AdminPanelGroup.AdminProd}`
      );
      expect(() =>
        stageGuard.allow(
          AdminPanelFeature.DisableAccount,
          AdminPanelGroup.AdminProd
        )
      ).throws(`Unknown group ${AdminPanelGroup.AdminProd}`);
      expect(() => prodGuard.getGroup(AdminPanelGroup.AdminStage)).throws(
        `Unknown group ${AdminPanelGroup.AdminStage}`
      );
      expect(() =>
        prodGuard.allow(
          AdminPanelFeature.DisableAccount,
          AdminPanelGroup.AdminStage
        )
      ).throws(`Unknown group ${AdminPanelGroup.AdminStage}`);
    });
  });
});
