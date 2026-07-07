/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const crypto = require('crypto');
const {
  pickSettingsDirectory,
  toServedUrl,
  sha256Base64,
  settingsServedUrl,
  buildManifest,
} = require('./waict-manifest-builder');

describe('pickSettingsDirectory', () => {
  it('honors the env override above everything else', () => {
    expect(pickSettingsDirectory(['dev', 'prod'], 'stage')).toBe('stage');
    expect(pickSettingsDirectory([], 'stage')).toBe('stage');
  });

  it('uses the single built directory when exactly one exists', () => {
    expect(pickSettingsDirectory(['dev'])).toBe('dev');
  });

  it('falls back to prod when zero or multiple directories exist', () => {
    expect(pickSettingsDirectory([])).toBe('prod');
    expect(pickSettingsDirectory(['dev', 'stage'])).toBe('prod');
  });

  it('accepts a custom fallback', () => {
    expect(pickSettingsDirectory([], undefined, 'dev')).toBe('dev');
  });
});

describe('toServedUrl', () => {
  it('rewrites settings/<servedEnv>/x to /settings/x', () => {
    expect(toServedUrl('settings/prod/static/js/main.js', 'prod')).toBe(
      '/settings/static/js/main.js'
    );
  });

  it('drops settings files for a non-served env', () => {
    expect(toServedUrl('settings/dev/static/js/main.js', 'prod')).toBeNull();
  });

  it('drops a bare settings/<env> path with no trailing file', () => {
    expect(toServedUrl('settings/prod', 'prod')).toBeNull();
  });

  it('serves non-settings paths at the root', () => {
    expect(toServedUrl('bundle/app.bundle.js', 'prod')).toBe(
      '/bundle/app.bundle.js'
    );
  });
});

describe('sha256Base64', () => {
  it('matches a known SHA-256 base64 digest', () => {
    const bytes = Buffer.from('hello');
    const expected = crypto
      .createHash('sha256')
      .update(bytes)
      .digest('base64');
    expect(sha256Base64(bytes)).toBe(expected);
  });
});

describe('settingsServedUrl', () => {
  it('uses a same-origin /settings/ path when no base is given', () => {
    expect(settingsServedUrl('static/js/main.js', '')).toBe(
      '/settings/static/js/main.js'
    );
  });

  it('prefixes the CDN base (trimming a trailing slash) when given', () => {
    expect(
      settingsServedUrl(
        'static/js/main.js',
        'https://cdn.accounts.firefox.com/settings/prod'
      )
    ).toBe('https://cdn.accounts.firefox.com/settings/prod/static/js/main.js');
    expect(settingsServedUrl('x.js', 'https://cdn/settings/prod/')).toBe(
      'https://cdn/settings/prod/x.js'
    );
  });
});

describe('buildManifest', () => {
  const readBytes = (rel) => Buffer.from('bytes-of:' + rel);
  const hashOf = (rel) => sha256Base64(readBytes(rel));

  it('URL-pins settings scripts and content-addresses own scripts', () => {
    const { manifest, count } = buildManifest({
      files: ['bundle/app.bundle.js', 'settings/prod/static/js/main.js'],
      readBytes,
      settingsDirectory: 'prod',
    });

    expect(count).toBe(2);
    // Content-server's own script -> any_hashes (runtime staticResourceUrl).
    expect(manifest.any_hashes).toEqual([hashOf('bundle/app.bundle.js')]);
    expect(manifest.hashes['/bundle/app.bundle.js']).toBeUndefined();
    // Settings script -> URL-pinned.
    expect(manifest.hashes['/settings/static/js/main.js']).toBe(
      hashOf('settings/prod/static/js/main.js')
    );
  });

  it('pins settings scripts by absolute CDN URL when a base is recorded', () => {
    const { manifest } = buildManifest({
      files: ['settings/prod/static/js/main.js'],
      readBytes,
      settingsDirectory: 'prod',
      settingsBaseUrl: 'https://cdn.accounts.firefox.com/settings/prod',
    });

    expect(
      manifest.hashes[
        'https://cdn.accounts.firefox.com/settings/prod/static/js/main.js'
      ]
    ).toBe(hashOf('settings/prod/static/js/main.js'));
    // No stale relative key.
    expect(manifest.hashes['/settings/static/js/main.js']).toBeUndefined();
  });

  it('excludes test/testDependencies bundles', () => {
    const { manifest, count } = buildManifest({
      files: [
        'bundle/test.bundle.js',
        'bundle/testDependencies.bundle.js',
        'settings/prod/static/js/main.js',
      ],
      readBytes,
      settingsDirectory: 'prod',
    });

    expect(count).toBe(1);
    expect(Object.keys(manifest.hashes)).toEqual([
      '/settings/static/js/main.js',
    ]);
  });

  it('skips settings files for a non-served env', () => {
    const { manifest, count } = buildManifest({
      files: ['settings/dev/static/js/main.js'],
      readBytes,
      settingsDirectory: 'prod',
    });

    expect(count).toBe(0);
    expect(manifest.hashes).toEqual({});
    expect(manifest.any_hashes).toEqual([]);
  });

  it('de-duplicates identical content in any_hashes', () => {
    const sameBytes = () => Buffer.from('identical');
    const { manifest } = buildManifest({
      files: ['bundle/a.js', 'bundle/b.js'],
      readBytes: sameBytes,
      settingsDirectory: 'prod',
    });

    expect(manifest.any_hashes).toHaveLength(1);
  });

  it('routes a declared "any" asset into any_hashes', () => {
    const { manifest } = buildManifest({
      files: ['settings/prod/query-fix.js'],
      readBytes,
      settingsDirectory: 'prod',
      publicAssets: { 'query-fix.js': { mode: 'any' } },
    });

    expect(manifest.any_hashes).toEqual([hashOf('settings/prod/query-fix.js')]);
    expect(manifest.hashes).toEqual({});
  });

  it('routes a declared "exact" asset to a ?v=<version> key', () => {
    const { manifest } = buildManifest({
      files: ['settings/prod/lang-fix.js'],
      readBytes,
      settingsDirectory: 'prod',
      publicAssets: { 'lang-fix.js': { mode: 'exact', v: 'abc123' } },
    });

    expect(manifest.hashes['/settings/lang-fix.js?v=abc123']).toBe(
      hashOf('settings/prod/lang-fix.js')
    );
  });

  it('pins an "exact" asset to the CDN base + ?v= when a base is recorded', () => {
    const { manifest } = buildManifest({
      files: ['settings/prod/lang-fix.js'],
      readBytes,
      settingsDirectory: 'prod',
      settingsBaseUrl: 'https://cdn/settings/prod',
      publicAssets: { 'lang-fix.js': { mode: 'exact', v: 'abc123' } },
    });

    expect(manifest.hashes['https://cdn/settings/prod/lang-fix.js?v=abc123']).toBe(
      hashOf('settings/prod/lang-fix.js')
    );
  });

  it('falls back to any-hash + warns when exact mode has no version', () => {
    const warn = jest.fn();
    const { manifest } = buildManifest({
      files: ['settings/prod/lang-fix.js'],
      readBytes,
      settingsDirectory: 'prod',
      publicAssets: { 'lang-fix.js': { mode: 'exact' } },
      warn,
    });

    // No ?v=undefined key is ever emitted.
    expect(
      Object.keys(manifest.hashes).some((k) => k.includes('undefined'))
    ).toBe(false);
    expect(manifest.any_hashes).toEqual([hashOf('settings/prod/lang-fix.js')]);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('no version'));
  });

  it('keys by served URL + warns for an unknown mode (never silently dropped)', () => {
    const warn = jest.fn();
    const { manifest, count } = buildManifest({
      files: ['settings/prod/weird.js'],
      readBytes,
      settingsDirectory: 'prod',
      publicAssets: { 'weird.js': { mode: 'bogus' } },
      warn,
    });

    expect(count).toBe(1);
    expect(manifest.hashes['/settings/weird.js']).toBe(
      hashOf('settings/prod/weird.js')
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('unknown mode'));
  });
});
