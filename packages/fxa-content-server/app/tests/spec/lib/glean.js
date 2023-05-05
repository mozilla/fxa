/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Glean from '@mozilla/glean/web';
import GleanMetrics from '../../../scripts/lib/glean';
import sinon from 'sinon';

const sandbox = sinon.createSandbox();
const mockConfig = {
  enabled: false,
  applicationId: 'testo',
  uploadEnabled: false,
  appDisplayVersion: '9001',
  channel: 'test',
  serverEndpoint: 'https://metrics.example.io/',
};

describe('lib/glean', () => {
  afterEach(() => {
    sandbox.restore();
  });

  describe('disabled', () => {
    it('does not calls Glean.initialize', () => {
      const initStub = sandbox.stub(Glean, 'initialize');
      GleanMetrics.initialize(mockConfig);
      sinon.assert.notCalled(initStub);
    });
  });

  describe('enabled', () => {
    it('calls Glean.initialize when enabled', () => {
      const initStub = sandbox.stub(Glean, 'initialize');
      GleanMetrics.initialize({ ...mockConfig, enabled: true });
      sinon.assert.calledOnce(initStub);
      sinon.assert.calledWith(
        initStub,
        mockConfig.applicationId,
        mockConfig.uploadEnabled,
        {
          appDisplayVersion: mockConfig.appDisplayVersion,
          channel: mockConfig.channel,
          serverEndpoint: mockConfig.serverEndpoint,
          maxEvents: 1,
        }
      );
    });
  });
});
