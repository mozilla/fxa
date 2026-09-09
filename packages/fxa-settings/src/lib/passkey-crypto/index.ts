/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * The whole public surface: seal `kB` for a passkey, and open it again.
 *
 * Named exports rather than `export *`, deliberately. The two crypto layers and
 * the context construction stay module-local, because a caller that assembled
 * the framing itself at wrap and unwrap time would produce envelopes nothing
 * can open — and the failure is indistinguishable from a wrong PRF output.
 */

export { createWrapEnvelope, openWrapEnvelope } from './envelope';
export type { EnvelopeContext } from './envelope';
