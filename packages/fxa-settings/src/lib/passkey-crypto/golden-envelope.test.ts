/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A frozen v1 envelope, decrypted by this module's own functions.
 *
 * NEVER REGENERATE `v1-envelope-fixture.json`. It was produced once, outside
 * this module, from the ciphersuite and Web Crypto directly. Regenerating it to
 * make a failure go away would destroy the only test here that can detect the
 * format moving.
 *
 * Every other test in this module seals and opens with the same code, so it
 * passes whatever the format is: swapping `info` and `aad`, changing the mode,
 * or reordering the envelope all round-trip perfectly and produce wraps nothing
 * else can open. This file is the one that fails instead.
 *
 * If it fails, the format has changed. That is a migration (see the README),
 * not a fixture update.
 */

import { V1_SIZES } from './constants';
import { buildEnvelopeContext } from './context';
import { openKb } from './hpke';
import { unwrapRecipientPrivateKey } from './key-wrap';
import fixture from './v1-envelope-fixture.json';

const bytes = (hex: string) => Uint8Array.from(Buffer.from(hex, 'hex'));

describe('frozen v1 envelope', () => {
  const info = bytes(fixture.info);
  const hpkeAad = bytes(fixture.hpkeAad);
  const aad = bytes(fixture.keyWrapAad);
  const sealedKb = {
    encapsulatedSecret: bytes(fixture.hpkeEncapsulatedSecret),
    ciphertext: bytes(fixture.hpkeSealedKb),
  };

  it('rebuilds the recorded context from uid, credentialId and keysChangedAt', () => {
    // The construction is as frozen as the sizes: change the framing and every
    // stored envelope stops opening. Nothing else here would notice, because
    // the rest of this file reads the context out of the fixture.
    const context = buildEnvelopeContext({
      uid: fixture.uid,
      credentialId: fixture.credentialId,
      keysChangedAt: fixture.keysChangedAt,
    });

    expect({
      info: Buffer.from(context.info).toString('hex'),
      hpkeAad: Buffer.from(context.hpkeAad).toString('hex'),
      keyWrapAad: Buffer.from(context.keyWrapAad).toString('hex'),
    }).toEqual({
      info: fixture.info,
      hpkeAad: fixture.hpkeAad,
      keyWrapAad: fixture.keyWrapAad,
    });
  });

  it('unwraps skR to the recorded scalar', async () => {
    const unwrapped = await unwrapRecipientPrivateKey(
      bytes(fixture.prfWrappedSkR),
      bytes(fixture.keyWrapIv),
      bytes(fixture.prfOut),
      aad
    );

    expect(Buffer.from(unwrapped).toString('hex')).toBe(fixture.skRRaw);
  });

  it('opens the sealed kB to the recorded value', async () => {
    const opened = await openKb(
      sealedKb,
      bytes(fixture.pkR),
      bytes(fixture.skRRaw),
      info,
      hpkeAad
    );

    expect(Buffer.from(opened).toString('hex')).toBe(fixture.kB);
  });

  it('recovers kB through both layers, using only the stored envelope and prfOut', async () => {
    // The real unlock path: prfOut plus what the server returns, nothing else.
    const skRRaw = await unwrapRecipientPrivateKey(
      bytes(fixture.prfWrappedSkR),
      bytes(fixture.keyWrapIv),
      bytes(fixture.prfOut),
      aad
    );

    const kB = await openKb(
      sealedKb,
      bytes(fixture.pkR),
      skRRaw,
      info,
      hpkeAad
    );

    expect(Buffer.from(kB).toString('hex')).toBe(fixture.kB);
  });

  it('fails to open when info and aad are swapped', async () => {
    // The drift a round-trip test cannot see: this seals and opens cleanly if
    // both sides swap together, and is un-openable everywhere else.
    await expect(
      openKb(sealedKb, bytes(fixture.pkR), bytes(fixture.skRRaw), hpkeAad, info)
    ).rejects.toThrow();
  });

  it('opens under a rotated keysChangedAt only when resealed', async () => {
    // Rotation rebuilds hpkeAad and reseals; the stored envelope must not open
    // under the new generation. This is the replay the binding exists to stop.
    const rotated = buildEnvelopeContext({
      uid: fixture.uid,
      credentialId: fixture.credentialId,
      keysChangedAt: fixture.keysChangedAt + 1,
    });

    await expect(
      openKb(
        sealedKb,
        bytes(fixture.pkR),
        bytes(fixture.skRRaw),
        info,
        rotated.hpkeAad
      )
    ).rejects.toThrow();
  });

  it('keeps keyWrapAad stable across a rotation, so skR stays unwrappable', async () => {
    // The other half of the contract: rotation has no prfOut, so binding the
    // generation into this layer would lock the credential out on every reset.
    const rotated = buildEnvelopeContext({
      uid: fixture.uid,
      credentialId: fixture.credentialId,
      keysChangedAt: fixture.keysChangedAt + 1,
    });

    const unwrapped = await unwrapRecipientPrivateKey(
      bytes(fixture.prfWrappedSkR),
      bytes(fixture.keyWrapIv),
      bytes(fixture.prfOut),
      rotated.keyWrapAad
    );

    expect(Buffer.from(unwrapped).toString('hex')).toBe(fixture.skRRaw);
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
