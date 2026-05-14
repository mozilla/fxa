/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { EmailCapabilityList } from './email-capability-list';

describe('EmailCapabilityList', () => {
  const buildManager = (caps: Record<string, string[]>) => ({
    getBusinessEntitlements: jest.fn().mockResolvedValue({
      findCapabilitiesForEmail: jest.fn().mockReturnValue(caps),
    }),
  });

  it('returns an empty map when disabled', async () => {
    const manager = buildManager({ c1: ['cap'] });
    const list = new EmailCapabilityList(
      { enabled: false },
      manager as any
    );
    expect(await list.getCapabilitiesForEmail('user@example.com')).toEqual({});
    expect(manager.getBusinessEntitlements).not.toHaveBeenCalled();
  });

  it('returns an empty map when no email is provided', async () => {
    const manager = buildManager({ c1: ['cap'] });
    const list = new EmailCapabilityList({ enabled: true }, manager as any);
    expect(await list.getCapabilitiesForEmail(undefined)).toEqual({});
    expect(await list.getCapabilitiesForEmail(null)).toEqual({});
    expect(await list.getCapabilitiesForEmail('')).toEqual({});
    expect(manager.getBusinessEntitlements).not.toHaveBeenCalled();
  });

  it('returns an empty map when the manager is not wired', async () => {
    const list = new EmailCapabilityList({ enabled: true });
    expect(
      await list.getCapabilitiesForEmail('user@example.com')
    ).toEqual({});
  });

  it('delegates to ProductConfigurationManager.getBusinessEntitlements', async () => {
    const findCapabilitiesForEmail = jest
      .fn()
      .mockReturnValue({ c1: ['capCms'] });
    const manager = {
      getBusinessEntitlements: jest.fn().mockResolvedValue({
        findCapabilitiesForEmail,
      }),
    };
    const list = new EmailCapabilityList({ enabled: true }, manager as any);

    const result = await list.getCapabilitiesForEmail('user@example.com');

    expect(manager.getBusinessEntitlements).toHaveBeenCalledTimes(1);
    expect(findCapabilitiesForEmail).toHaveBeenCalledWith('user@example.com');
    expect(result).toEqual({ c1: ['capCms'] });
  });

  it('tolerates absent config gracefully', async () => {
    const list = new EmailCapabilityList({} as any);
    expect(await list.getCapabilitiesForEmail('anyone@example.com')).toEqual(
      {}
    );
  });
});
