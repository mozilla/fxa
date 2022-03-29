/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  Feature,
  AdminPanelGaurd,
  Groups,
  PermissionLevel,
} from '../../support-agents';
import { Gaurd, Permissions } from '../../support-agents/Gaurd';
import { expect } from 'chai';

describe('support agents', () => {
  describe('Gaurd Base', () => {
    class TestGaurd extends Gaurd<string, string> {
      constructor(permissions: Permissions) {
        super(permissions);
      }
      public groupToLevel(group: string): number {
        if (group == 'foo') {
          return 1;
        }
        return 0;
      }
    }

    let gaurd: TestGaurd;

    before(() => {
      gaurd = new TestGaurd({
        test: {
          name: 'test feature',
          level: 0,
        },
      });
    });

    it('gets group level', () => {
      expect(gaurd.groupToLevel('foo')).equal(1);
      expect(gaurd.groupToLevel('bar')).equal(0);
    });

    it('gets feature', () => {
      expect(gaurd.getFeature('test')).to.exist;
    });

    it('allows', () => {
      expect(gaurd.allow('test', 'bar')).true;
    });

    it('denies', () => {
      expect(gaurd.allow('test', 'foo')).false;
    });

    it('throws on uknown feature', () => {
      expect(() => gaurd.getFeature('foo')).throws('Unknown feature foo');
      expect(() => gaurd.allow('foo', 'bar')).throws('Unkown feature foo');
    });
  });

  describe('Admin Panel Gaurd', () => {
    let gaurd: AdminPanelGaurd;

    before(() => {
      gaurd = new AdminPanelGaurd();
    });

    it('allows', () => {
      expect(gaurd.allow(Feature.DisableAccounts, Groups.AdminProd)).true;
    });

    it('determines group level', () => {
      expect(gaurd.groupToLevel(Groups.AdminProd)).equal(PermissionLevel.Admin);
      expect(gaurd.groupToLevel(Groups.AdminStage)).equal(
        PermissionLevel.Admin
      );
      expect(gaurd.groupToLevel(Groups.SupportAgentProd)).equal(
        PermissionLevel.Support
      );
      expect(gaurd.groupToLevel(Groups.SupportAgentStage)).equal(
        PermissionLevel.Support
      );
      expect(gaurd.groupToLevel(Groups.None)).equal(PermissionLevel.None);
    });

    it('denies', () => {
      expect(gaurd.allow(Feature.DisableAccounts, Groups.SupportAgentStage))
        .false;
    });

    it('gets feature', () => {
      expect(gaurd.getFeature(Feature.LookupByEmail)).equal({
        name: 'Lookup Account By Email',
        level: PermissionLevel.Admin,
      });
    });
  });
});
