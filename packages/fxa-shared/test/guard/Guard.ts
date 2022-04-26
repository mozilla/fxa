/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Guard, Permissions, Groups } from '../../guards';
import { expect } from 'chai';

describe('support agents', () => {
  describe('Guard', () => {
    class TestGuard extends Guard<string, string> {
      constructor(permissions: Permissions, groups: Groups) {
        super(permissions, groups);
      }
    }

    let guard: TestGuard;

    before(() => {
      guard = new TestGuard(
        {
          test: {
            name: 'test feature',
            level: 0,
          },
        },
        {
          foo: {
            name: 'test foo',
            header: 'test_foo',
            level: 0,
          },
          bar: {
            name: 'test bar',
            header: 'test_bar',
            level: 1,
          },
        }
      );
    });

    it('gets best group', () => {
      expect(guard.getBestGroup('foo')).deep.equal({
        name: 'test foo',
        header: 'test_foo',
        level: 0,
      });

      expect(guard.getBestGroup('bar')).deep.equal({
        name: 'test bar',
        header: 'test_bar',
        level: 1,
      });

      expect(guard.getBestGroup('foo, bar')).deep.equal({
        name: 'test foo',
        header: 'test_foo',
        level: 0,
      });

      expect(guard.getBestGroup('bar, foo')).deep.equal({
        name: 'test foo',
        header: 'test_foo',
        level: 0,
      });
    });

    it('gets group', () => {
      expect(guard.getGroup('foo')).deep.equal({
        name: 'test foo',
        header: 'test_foo',
        level: 0,
      });
      expect(guard.getGroup('bar')).deep.equal({
        name: 'test bar',
        header: 'test_bar',
        level: 1,
      });
    });

    it('gets feature', () => {
      expect(guard.getFeature('test')).deep.equal({
        name: 'test feature',
        level: 0,
      });
    });

    it('gets feature flags', () => {
      const groupFoo = guard.getGroup('foo');
      const groupBar = guard.getGroup('bar');
      expect(guard.getFeatureFlags(groupFoo)).deep.members([
        {
          id: 'test',
          enabled: true,
          name: 'test feature',
          description: undefined,
        },
      ]);
      expect(guard.getFeatureFlags(groupBar)).deep.members([
        {
          id: 'test',
          enabled: false,
          name: 'test feature',
          description: undefined,
        },
      ]);
    });

    it('allows', () => {
      expect(guard.allow('test', 'foo')).true;
    });

    it('denies', () => {
      expect(guard.allow('test', 'bar')).false;
    });

    it('throws on unknown feature', () => {
      expect(() => guard.getFeature('foo')).throws('Unknown feature foo');
      expect(() => guard.allow('foo', 'bar')).throws('Unknown feature foo');
    });

    it('throws on unknown group', () => {
      expect(() => guard.getGroup('test')).throws('Unknown group test');
      expect(() => guard.allow('test', 'test')).throws('Unknown group test');
    });
  });
});
