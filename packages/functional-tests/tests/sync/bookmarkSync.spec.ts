/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Sanity check that Sync works end to end with FxA: one Firefox adds a
 * bookmark and syncs, and a second Firefox on the same account receives it.
 *
 * Needs the local Sync server (syncstorage-rs) on :8000. CI does not start it,
 * so the spec skips there and on stage and production.
 */

import { test, expect } from '../../lib/fixtures/pairing';
import { MarionetteClient } from '../../lib/marionette';
import { signInAuthorityViaMarionette } from '../../lib/pairing-helpers';

const SYNC_SERVER_HEARTBEAT = `http://${process.env.FXA_LOCAL_HOST ?? 'localhost'}:8000/__heartbeat__`;
const SYNC_TIMEOUT_MS = 60_000;

async function syncServerIsUp(): Promise<boolean> {
  try {
    return (await fetch(SYNC_SERVER_HEARTBEAT)).ok;
  } catch {
    return false;
  }
}

/** Run a bookmarks sync until it succeeds and `check()` in chrome returns a value. */
async function syncBookmarks(
  client: MarionetteClient,
  check = 'return (await Weave.Service.engineManager.get("bookmarks").getLastSync()) > 0;',
  args: unknown[] = []
): Promise<unknown> {
  await client.setContext('chrome');
  return client.executeAsyncScript(
    `
    const resolve = arguments[arguments.length - 1];
    const args = Array.from(arguments).slice(0, -1);
    const { Weave } = ChromeUtils.importESModule(
      "resource://services-sync/main.sys.mjs"
    );
    const { LOGIN_SUCCEEDED, SYNC_SUCCEEDED } = ChromeUtils.importESModule(
      "resource://services-sync/constants.sys.mjs"
    );
    const { PlacesUtils } = ChromeUtils.importESModule(
      "resource://gre/modules/PlacesUtils.sys.mjs"
    );
    const check = async (...args) => { ${check} };
    (async () => {
      let status;
      for (let i = 0; i < 10; i++) {
        await Weave.Service.sync({ engines: ["bookmarks"] });
        status = { login: Weave.Status.login, sync: Weave.Status.sync };
        // Status.sync keeps its last value when the login fails, so check both.
        if (
          Weave.Status.login === LOGIN_SUCCEEDED &&
          Weave.Status.sync === SYNC_SUCCEEDED
        ) {
          const result = await check(...args);
          if (result) {
            resolve(result);
            return;
          }
        }
        await new Promise((r) => setTimeout(r, 2000));
      }
      resolve({ error: "bookmarks did not sync", status });
    })().catch((e) => resolve({ error: String(e) }));
    `,
    { sandbox: 'system', args, timeoutMs: SYNC_TIMEOUT_MS }
  );
}

test.describe('severity-2', () => {
  test.describe.serial('Sync', () => {
    test.beforeAll(async ({ target }) => {
      // beforeAll, so the Firefox fixtures do not launch when the spec skips.
      test.skip(target.name !== 'local', 'needs the local Sync server');
      test.skip(!(await syncServerIsUp()), 'the Sync server on :8000 is down');
    });

    test('a bookmark syncs to a second Firefox on the same account', async ({
      target,
      testAccountTracker,
      marionetteAuthority: firstFirefox,
      marionetteSupplicant: secondFirefox,
    }) => {
      const { email, password } = await testAccountTracker.signUp();
      const url = 'https://example.com/fxa-bookmark-sync';

      await test.step('Add a bookmark in the first Firefox and sync', async () => {
        await signInAuthorityViaMarionette(
          firstFirefox.client,
          target.contentServerUrl,
          email,
          password
        );
        await firstFirefox.client.setContext('chrome');
        const inserted = await firstFirefox.client.executeAsyncScript(
          `
          const [url, resolve] = arguments;
          const { PlacesUtils } = ChromeUtils.importESModule(
            "resource://gre/modules/PlacesUtils.sys.mjs"
          );
          PlacesUtils.bookmarks
            .insert({
              parentGuid: PlacesUtils.bookmarks.toolbarGuid,
              url,
              title: "FxA bookmark sync",
            })
            .then(
              () => resolve(true),
              (e) => resolve({ error: String(e) })
            );
          `,
          { sandbox: 'system', args: [url] }
        );
        expect(inserted).toBe(true);
        expect(await syncBookmarks(firstFirefox.client)).toBe(true);
      });

      await test.step('The second Firefox receives the bookmark', async () => {
        await signInAuthorityViaMarionette(
          secondFirefox.client,
          target.contentServerUrl,
          email,
          password
        );
        const title = await syncBookmarks(
          secondFirefox.client,
          `const bookmark = await PlacesUtils.bookmarks.fetch({ url: args[0] });
           return bookmark && bookmark.title;`,
          [url]
        );
        expect(title).toBe('FxA bookmark sync');
      });
    });
  });
});
