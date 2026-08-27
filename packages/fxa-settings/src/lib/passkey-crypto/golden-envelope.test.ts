/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A frozen v1 envelope, decrypted by this module's own functions.
 *
 * Every other test here seals and opens with the same code, so it passes
 * whatever the format is: changing the mode, the framing, or the labels all
 * round-trip perfectly and produce wraps nothing else can open. This file is
 * the one that fails instead.
 *
 * If it fails, the format has changed. That is a migration (see the README),
 * not a fixture update — `generate-v1-envelope-fixture.mjs` is for the
 * deliberate case only.
 */

import { V1_SIZES } from './constants';
import { bindingBytes } from './encoding';
import { openKb } from './hpke';
import { unwrapRecipientPrivateKey } from './key-wrap';
import fixture from './v1-envelope-fixture.json';

const bytes = (hex: string) => Uint8Array.from(Buffer.from(hex, 'hex'));

describe('frozen v1 envelope', () => {
  const context = {
    uid: fixture.uid,
    credentialId: fixture.credentialId,
  };
  const sealedKb = {
    encapsulatedSecret: bytes(fixture.hpkeEncapsulatedSecret),
    ciphertext: bytes(fixture.hpkeSealedKb),
  };

  it('rebuilds the recorded binding from uid and credentialId', () => {
    // Change the framing and every stored envelope stops opening. The tests
    // below rebuild it the same way at open time, so none of them would notice.
    expect(Buffer.from(bindingBytes(context)).toString('hex')).toBe(
      fixture.binding
    );
  });

  it('unwraps skR to the recorded scalar', async () => {
    const unwrapped = await unwrapRecipientPrivateKey(
      bytes(fixture.prfWrappedSkR),
      bytes(fixture.keyWrapIv),
      bytes(fixture.prfOut),
      context
    );

    expect(Buffer.from(unwrapped).toString('hex')).toBe(fixture.skRRaw);
  });

  it('opens the sealed kB to the recorded value', async () => {
    const opened = await openKb(
      sealedKb,
      bytes(fixture.pkR),
      bytes(fixture.skRRaw),
      context
    );

    expect(Buffer.from(opened).toString('hex')).toBe(fixture.kB);
  });

  it('recovers kB through both layers, using only the stored envelope and prfOut', async () => {
    // The real unlock path: prfOut plus what the server returns, nothing else.
    const skRRaw = await unwrapRecipientPrivateKey(
      bytes(fixture.prfWrappedSkR),
      bytes(fixture.keyWrapIv),
      bytes(fixture.prfOut),
      context
    );

    const kB = await openKb(sealedKb, bytes(fixture.pkR), skRRaw, context);

    expect(Buffer.from(kB).toString('hex')).toBe(fixture.kB);
  });

  it('records every field at its v1 width', () => {
    expect({
      pkR: fixture.pkR.length / 2,
      skRRaw: fixture.skRRaw.length / 2,
      prfWrappedSkR: fixture.prfWrappedSkR.length / 2,
      keyWrapIv: fixture.keyWrapIv.length / 2,
      hpkeEncapsulatedSecret: fixture.hpkeEncapsulatedSecret.length / 2,
      hpkeSealedKb: fixture.hpkeSealedKb.length / 2,
    }).toEqual({
      pkR: V1_SIZES.pkR,
      skRRaw: V1_SIZES.skRRaw,
      prfWrappedSkR: V1_SIZES.prfWrappedSkR,
      keyWrapIv: V1_SIZES.keyWrapIv,
      hpkeEncapsulatedSecret: V1_SIZES.hpkeEncapsulatedSecret,
      hpkeSealedKb: V1_SIZES.hpkeSealedKb,
    });
  });
});
