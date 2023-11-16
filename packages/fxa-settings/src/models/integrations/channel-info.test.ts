/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ModelDataStore, GenericData } from '../../lib/model-data';
import { ChannelInfo } from './channel-info';

describe('models/integrations/channel-info', function () {
  let data: ModelDataStore;
  let model: ChannelInfo;

  beforeEach(function () {
    data = new GenericData({
      channel_id: Buffer.from('id123').toString('base64'),
      channel_key: Buffer.from('key123').toString('base64'),
    });
    model = new ChannelInfo(data);
  });

  it('exists', () => {
    expect(model).toBeDefined();
  });

  it('binds model to data store', () => {
    data.set('channel_id', Buffer.from('foo').toString('base64'));
    data.set('channel_key', Buffer.from('bar').toString('base64'));

    expect(model.channelId).toEqual(Buffer.from('foo').toString('base64'));
    expect(model.channelKey).toEqual(Buffer.from('bar').toString('base64'));
  });

  it('validates', () => {
    data.set('channel_id', '{}');
    expect(() => {
      model.validate();
    }).toThrow();
  });
});
