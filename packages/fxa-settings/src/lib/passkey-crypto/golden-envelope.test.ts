/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A frozen v1 envelope, decrypted by this module's own functions.
 *
 * DO NOT REGENERATE `v1-envelope-fixture.json` to make a failure go away — that
 * destroys the only test here that can detect the format moving. It is produced
 * outside this module, from the ciphersuite and Web Crypto directly, so it does
 * not merely restate what the code does.
 *
 * Regenerating is defensible only while no shipped client has written a v1
 * envelope, because until then no stored row depends on these bytes. After the
 * first production write it is a migration, not a fixture update — the envelope
 * has no version field, so there is one decrypt path and no way to tell an old
 * row from a new one. See the README.
 *
 * Every other test in this module seals and opens with the same code, so it
 * passes whatever the format is: swapping `info` and `aad`, changing the mode,
 * reframing the context, or reordering the envelope all round-trip perfectly
 * and produce wraps nothing else can open. This file is the one that fails
 * instead.
 */

import type { PasskeyWrapEnvelope } from 'fxa-auth-client/browser';
import { V1_SIZES } from './constants';
import { buildEnvelopeContext, openWrapEnvelope } from './envelope';
import { openKb } from './hpke';
import { unwrapRecipientPrivateKey } from './key-wrap';
import fixture from './v1-envelope-fixture.json';

const bytes = (hex: string) => Uint8Array.from(Buffer.from(hex, 'hex'));
const hex = (value: Uint8Array) => Buffer.from(value).toString('hex');

describe('frozen v1 envelope', () => {
  const context = bytes(fixture.context);
  const sealedKb = {
    encapsulatedSecret: bytes(fixture.hpkeEncapsulatedSecret),
    ciphertext: bytes(fixture.hpkeSealedKb),
  };
  const envelope: PasskeyWrapEnvelope = {
    pkR: bytes(fixture.pkR),
    prfWrappedSkR: bytes(fixture.prfWrappedSkR),
    keyWrapIv: bytes(fixture.keyWrapIv),
    hpkeEncapsulatedSecret: sealedKb.encapsulatedSecret,
    hpkeSealedKb: sealedKb.ciphertext,
  };

  it('rebuilds the recorded context from uid and credentialId', () => {
    // The one assertion that pins the representations: `uid` as hex,
    // `credentialId` as base64url, length-prefixed in that order. A round-trip
    // test passes even when both sides drift together; this does not.
    expect(
      hex(
        buildEnvelopeContext({
          uid: fixture.uid,
          credentialId: fixture.credentialId,
        })
      )
    ).toBe(fixture.context);
  });

  it('unwraps skR to the recorded scalar', async () => {
    const unwrapped = await unwrapRecipientPrivateKey(
      envelope.prfWrappedSkR,
      envelope.keyWrapIv,
      bytes(fixture.prfOut),
      context
    );

    expect(hex(unwrapped)).toBe(fixture.skRRaw);
  });

  it('opens the sealed kB to the recorded value', async () => {
    const opened = await openKb(
      sealedKb,
      envelope.pkR,
      bytes(fixture.skRRaw),
      context,
      new Uint8Array(0)
    );

    expect(hex(opened)).toBe(fixture.kB);
  });

  it('recovers kB from the stored envelope, prfOut and credential context', async () => {
    const kB = await openWrapEnvelope({
      envelope,
      prfOut: bytes(fixture.prfOut),
      uid: fixture.uid,
      credentialId: fixture.credentialId,
    });

    expect(hex(kB)).toBe(fixture.kB);
  });

  it('fails to open when the context is bound as aad instead of info', async () => {
    // The drift a round-trip test cannot see: this seals and opens cleanly if
    // both sides swap together, and is un-openable everywhere else.
    await expect(
      openKb(
        sealedKb,
        envelope.pkR,
        bytes(fixture.skRRaw),
        new Uint8Array(0),
        context
      )
      // The HPKE layer surfaces the library's own failure, not Web Crypto's.
    ).rejects.toThrow(expect.objectContaining({ name: 'OpenError' }) as Error);
  });

  it('fails to recover kB under a different account', async () => {
    await expect(
      openWrapEnvelope({
        envelope,
        prfOut: bytes(fixture.prfOut),
        uid: 'ffeeddccbbaa00998877665544332211',
        credentialId: fixture.credentialId,
      })
    ).rejects.toThrow(
      expect.objectContaining({ name: 'OperationError' }) as Error
    );
  });

  it('fails to recover kB under a different credential', async () => {
    await expect(
      openWrapEnvelope({
        envelope,
        prfOut: bytes(fixture.prfOut),
        uid: fixture.uid,
        credentialId: 'b3RoZXItY3JlZGVudGlhbA',
      })
    ).rejects.toThrow(
      expect.objectContaining({ name: 'OperationError' }) as Error
    );
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
