/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { expect } from 'chai';
import * as uuid from 'uuid';

import {
  CommonPiiActions,
  DepthFilter,
  TRUNCATED,
  FILTERED,
  PiiRegexFilter,
  BreadthFilter,
} from '../../sentry/pii-filter-actions';

describe('pii-filter-actions', () => {
  describe('DepthFilter', () => {
    it('truncates objects', () => {
      const filter = new DepthFilter(1);

      expect(filter.execute('foo', 1)).to.deep.equal({
        val: 'foo',
        exitPipeline: false,
      });
      expect(filter.execute(null, 1)).to.deep.equal({
        val: null,
        exitPipeline: true,
      });
    });

    it('truncates objects when depth is greater than or equal to max depth', () => {
      const filter = new DepthFilter(1);
      expect(filter.execute({ foo: 'bar' }, 1)).to.deep.equal({
        val: {
          foo: TRUNCATED,
        },
        exitPipeline: true,
      });
    });

    it('does not truncate if depth is less than max depth ', () => {
      const filter = new DepthFilter(1);
      expect(filter.execute({ foo: 'bar' }, 0)).to.deep.equal({
        val: { foo: 'bar' },
        exitPipeline: false,
      });
    });

    it('handles null', () => {
      const filter = new DepthFilter(1);
      expect(filter.execute(null, 1)).to.deep.equal({
        val: null,
        exitPipeline: true,
      });
    });
  });

  describe('BreadthFilter', () => {
    it('truncates objects', () => {
      const filter = new BreadthFilter(1);

      expect(filter.execute('foo')).to.deep.equal({
        val: 'foo',
        exitPipeline: false,
      });
      expect(filter.execute(null)).to.deep.equal({
        val: null,
        exitPipeline: true,
      });
    });

    it('truncates object of size greater than max breadth', () => {
      const filter = new BreadthFilter(1);
      expect(filter.execute({ foo: '1', bar: '2', baz: '3' })).to.deep.equal({
        val: {
          foo: '1',
          [TRUNCATED]: 2,
        },
        exitPipeline: false,
      });
    });

    it('does not truncate object of size equal to max breadth', () => {
      const filter = new BreadthFilter(3);
      expect(filter.execute(['foo', 'bar', 'baz'])).to.deep.equal({
        val: ['foo', 'bar', 'baz'],
        exitPipeline: false,
      });
    });

    it('does not truncate object of size less than max breadth', () => {
      const filter = new BreadthFilter(5);
      expect(filter.execute(['foo', 'bar', 'baz'])).to.deep.equal({
        val: ['foo', 'bar', 'baz'],
        exitPipeline: false,
      });
    });

    it('truncates array of size greater than max breadth', () => {
      const filter = new BreadthFilter(1);
      expect(filter.execute(['foo', 'bar', 'baz'])).to.deep.equal({
        val: ['foo', `${TRUNCATED}:2`],
        exitPipeline: false,
      });
    });

    it('does not truncate array of size less than max breadth', () => {
      const filter = new BreadthFilter(5);
      expect(filter.execute(['foo', 'bar', 'baz'])).to.deep.equal({
        val: ['foo', 'bar', 'baz'],
        exitPipeline: false,
      });
    });

    it('does not truncate array of size equal to max breadth', () => {
      const filter = new BreadthFilter(3);
      expect(filter.execute(['foo', 'bar', 'baz'])).to.deep.equal({
        val: ['foo', 'bar', 'baz'],
        exitPipeline: false,
      });
    });

    it('handles empty array', () => {
      const filter = new BreadthFilter(1);
      expect(filter.execute([])).to.deep.equal({
        val: [],
        exitPipeline: true,
      });
    });

    it('handles empty object', () => {
      const filter = new BreadthFilter(1);
      expect(filter.execute({})).to.deep.equal({
        val: {},
        exitPipeline: true,
      });
    });
  });

  describe('PiiRegexFilter', () => {
    it('filters string', () => {
      const filter = new PiiRegexFilter(/foo/gi, 'values', '[BAR]');
      const value = filter.execute('test foo regex filter');
      expect(value).to.deep.equal({
        val: 'test [BAR] regex filter',
        exitPipeline: false,
      });
    });

    it('filters string and determines exitPipeline', () => {
      const filter = new PiiRegexFilter(/foo/gi, 'values', '[BAR]');
      const value = filter.execute('foo');
      expect(value).to.deep.equal({ val: '[BAR]', exitPipeline: true });
    });

    it('filters object value', () => {
      const filter1 = new PiiRegexFilter(/foo/gi, 'both', '[BAR]');
      const filter2 = new PiiRegexFilter(/foo/gi, 'values', '[BAR]');

      const { val: value1 } = filter1.execute({
        item: 'test foo regex filter',
      });
      const { val: value2 } = filter2.execute({
        item: 'test foo regex filter',
      });

      expect(value1.item).to.equal('test [BAR] regex filter');
      expect(value2.item).to.equal('test [BAR] regex filter');
    });

    it('filters object key', () => {
      const filter = new PiiRegexFilter(/foo/gi, 'keys', '[BAR]');

      const { val: value } = filter.execute({
        foo: 'test foo regex filter',
      });

      expect(value.foo).to.equal('[BAR]');
    });

    describe('checksOn', () => {
      it('checks on values', () => {
        const filter = new PiiRegexFilter(/foo/gi, 'values', '[BAR]');
        const { val: value } = filter.execute({
          foo: 'test foo regex filter',
          bar: 'test foo regex filter',
        });
        expect(value.foo).to.equal('test [BAR] regex filter');
        expect(value.bar).to.equal('test [BAR] regex filter');
      });

      it('checks on keys', () => {
        const filter = new PiiRegexFilter(/foo/gi, 'keys', '[BAR]');
        const { val: value } = filter.execute({
          foo: 'test foo regex filter',
          bar: 'test foo regex filter',
        });
        expect(value.foo).to.equal('[BAR]');
        expect(value.bar).to.equal('test foo regex filter');
      });

      it('checks on keys and values', () => {
        const filter = new PiiRegexFilter(/foo/gi, 'both', '[BAR]');
        const { val: value } = filter.execute({
          foo: 'test foo regex filter',
          bar: 'test foo regex filter',
        });
        expect(value.foo).to.equal('[BAR]');
        expect(value.bar).to.equal('test [BAR] regex filter');
      });
    });
  });

  describe('CommonPiiActions', () => {
    it('filters emails', () => {
      const { val: result } = CommonPiiActions.emailValues.execute({
        foo: 'email: test@123.com -- 123@test.com --',
        bar: '123',
      });

      expect(result).to.deep.equal({
        foo: `email: ${FILTERED} -- ${FILTERED} --`,
        bar: '123',
      });
    });

    it('filters email in url', () => {
      const { val: result } = CommonPiiActions.emailValues.execute(
        'http://foo.bar/?email=foxkey@mozilla.com&key=1'
      );
      expect(result).to.equal(`http://foo.bar/?${FILTERED}&key=1`);
    });

    it('filters email in route', () => {
      const { val: result } = CommonPiiActions.emailValues.execute(
        '/account?email=foxkey@mozilla.com&key=1'
      );
      expect(result).to.equal(`/account?email=${FILTERED}&key=1`);
    });

    it('filters email in query', () => {
      const { val: result } = CommonPiiActions.emailValues.execute(
        `where email='test@mozilla.com'`
      );

      expect(result).to.equal(`where email='${FILTERED}'`);
    });

    it('filters username / password from url', () => {
      const { val: result } = CommonPiiActions.urlUsernamePassword.execute(
        'http://me:wut@foo.bar/'
      );
      expect(result).to.equal(`http://${FILTERED}:${FILTERED}@foo.bar/`);
    });

    it('ipv6 values', () => {
      const { val: result } = CommonPiiActions.ipV6Values.execute({
        foo: 'ipv6: 2001:0db8:85a3:0000:0000:8a2e:0370:7334 -- FE80:0000:0000:0000:0202:B3FF:FE1E:8329 --',
        bar: '123',
      });
      expect(result).to.deep.equal({
        foo: `ipv6: ${FILTERED} -- ${FILTERED} --`,
        bar: '123',
      });
    });

    it('ipv4 values', () => {
      const { val: result } = CommonPiiActions.ipV4Values.execute({
        foo: '-- 127.0.0.1 -- 10.0.0.1 -- ',
        bar: '1.2.3',
      });
      expect(result).to.deep.equal({
        foo: `-- ${FILTERED} -- ${FILTERED} -- `,
        bar: '1.2.3',
      });
    });

    it('filters pii keys', () => {
      const { val: result } = CommonPiiActions.piiKeys.execute({
        'oidc-test': 'foo',
        'OIDC-TEST': 'foo',
        'remote-groups': 'foo',
        'REMOTE-GROUPS': 'foo',
        email_address: 'foo',
        email: 'foo',
        EmailAddress: 'foo',
        ip: 'foo',
        ip_addr: 'foo',
        ip_address: 'foo',
        IpAddress: 'foo',
        uid: 'foo',
        user: 'foo',
        username: 'foo',
        user_name: 'foo',
        UserName: 'foo',
        userid: 'foo',
        UserId: 'foo',
        user_id: 'foo',
        bar: '123',
      });

      expect(result).to.deep.equal({
        'oidc-test': FILTERED,
        'OIDC-TEST': FILTERED,
        'remote-groups': FILTERED,
        'REMOTE-GROUPS': FILTERED,
        email: FILTERED,
        email_address: FILTERED,
        EmailAddress: FILTERED,
        ip: FILTERED,
        ip_addr: FILTERED,
        ip_address: FILTERED,
        IpAddress: FILTERED,
        uid: FILTERED,
        user: FILTERED,
        username: FILTERED,
        user_name: FILTERED,
        UserName: FILTERED,
        userid: FILTERED,
        user_id: FILTERED,
        UserId: FILTERED,
        bar: '123',
      });
    });

    it('filters token values', () => {
      const token1 = uuid.v4().replace(/-/g, '');
      const token2 = uuid.v4().replace(/-/g, '');
      const token3 = uuid.v4().toString();
      const { val: result } = CommonPiiActions.tokenValues.execute({
        foo: `-- ${token1}\n${token2}--`,
        bar: token3,
      });

      expect(result).to.deep.equal({
        foo: `-- ${FILTERED}\n${FILTERED}--`,
        bar: token3,
      });
    });

    it('filters 64 byte token values', () => {
      const token1 = uuid.v4().replace(/-/g, '');
      const { val: result } = CommonPiiActions.tokenValues.execute({
        foo: `X'${token1}${token1}'`,
      });

      expect(result).to.deep.equal({
        foo: `X'${FILTERED}'`,
      });
    });

    it('filters token value in url', () => {
      const result = CommonPiiActions.tokenValues.execute(
        'https://foo.bar/?uid=12345678123456781234567812345678'
      );
      expect(result.val).to.equal(`https://foo.bar/?uid=${FILTERED}`);
    });

    it('filters token value in db statement', () => {
      const result = CommonPiiActions.tokenValues.execute(
        `Call accountDevices_17(X'cce22e4006d243c895c7596e2cad53d8',500)`
      );
      expect(result.val).to.equal(`Call accountDevices_17(X'${FILTERED}',500)`);
    });

    it('filters token value in db query', () => {
      const result = CommonPiiActions.tokenValues.execute(
        ` where uid = X'cce22e4006d243c895c7596e2cad53d8' `
      );
      expect(result.val).to.equal(` where uid = X'${FILTERED}' `);
    });

    it('filters multiple multiline token values', () => {
      const token = '12345678123456781234567812345678';
      const { val: result } = CommonPiiActions.tokenValues.execute(
        `${token}--${token}\n${token}`
      );
      expect(result).to.equal(`${FILTERED}--${FILTERED}\n${FILTERED}`);
    });
  });
});
