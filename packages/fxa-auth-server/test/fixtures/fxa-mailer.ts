/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createMock, DeepMocked, PartialFuncReturn } from '@golevelup/ts-jest';
import { Container } from 'typedi';
import { FxaMailer } from '../../lib/senders/fxa-mailer';

/**
 * Installs a typed mock {@link FxaMailer} into the TypeDI Container, the way
 * production resolves it (`Container.get(FxaMailer)`), and returns the mock for
 * spying.
 *
 * `FxaMailer` is a real class, so the mock is `createMock<FxaMailer>()` — it
 * tracks the production type (a renamed/removed/retyped `send*` method surfaces
 * as a compile error in the spec) with no hand-maintained method list. This
 * replaces the legacy `mocks.mockFxaMailer()`.
 *
 * The only reason this is a fixture and not an inline `createMock<FxaMailer>()`
 * is the Container wiring + the need for matching teardown. **Always pair it
 * with {@link uninstallMockFxaMailer} in `afterEach`** — TypeDI state is not
 * reset by Jest's `clearMocks`, so an un-removed mock leaks into later specs.
 *
 * `canSend` defaults to `true` so the modern FxaMailer code path is exercised;
 * override it (or any method) via the argument or `.mockReturnValue(...)`.
 *
 * Prefer mocking `FxaMailer` over the legacy `mailer`. Tests that only exercise
 * the FxaMailer path can pass a throwaway stub for the legacy `mailer` argument
 * rather than mocking its untyped surface.
 *
 * @example
 * let mailer: DeepMocked<FxaMailer>;
 * beforeEach(() => { mailer = installMockFxaMailer(); });
 * afterEach(() => { uninstallMockFxaMailer(); });
 * // ...
 * expect(mailer.sendPostNewRecoveryCodesEmail).toHaveBeenCalledTimes(1);
 */
export function installMockFxaMailer(
  overrides?: PartialFuncReturn<FxaMailer>
): DeepMocked<FxaMailer> {
  const mailer = createMock<FxaMailer>({
    canSend: () => true,
    ...overrides,
  });
  Container.set(FxaMailer, mailer);
  return mailer;
}

/**
 * Removes the mock {@link FxaMailer} from the Container. Call in `afterEach`.
 */
export function uninstallMockFxaMailer(): void {
  Container.remove(FxaMailer);
}
