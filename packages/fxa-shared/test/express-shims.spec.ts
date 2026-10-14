/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import 'mocha';

import { assert } from 'chai';

import * as lib from '@fxa/shared/express';
import express, * as expressShim from '../express';
import cors, * as corsShim from '../express/cors';
import geolocate, * as geolocateShim from '../express/geo-locate';
import remoteAddress, * as remoteAddressShim from '../express/remote-address';
import routing, * as routingShim from '../express/routing';

describe('express shims', () => {
  it('re-export express as named and default', () => {
    assert.strictEqual(expressShim.express, lib.express);
    assert.strictEqual(express, lib.express);
  });

  it('re-export cors as named and default', () => {
    assert.strictEqual(corsShim.cors, lib.cors);
    assert.strictEqual(cors, lib.cors);
  });

  it('re-export geolocate as named and default', () => {
    assert.strictEqual(geolocateShim.geolocate, lib.geolocate);
    assert.strictEqual(geolocate, lib.geolocate);
  });

  it('re-export remoteAddress as named and default', () => {
    assert.strictEqual(remoteAddressShim.remoteAddress, lib.remoteAddress);
    assert.strictEqual(remoteAddress, lib.remoteAddress);
  });

  it('re-export routing as named and default', () => {
    assert.strictEqual(routingShim.routing, lib.routing);
    assert.strictEqual(routing, lib.routing);
  });
});
