/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { redirectToSp2 } from './redirectToSp2';
import { RedirectParamsFactory, SP2RedirectConfigFactory } from '../factories';
import { RedirectParams } from '../sp2map.config';

describe('redirectToSp2', () => {
  const defaultOfferingId = 'vpn';
  const mockReportError = jest.fn();

  beforeEach(() => {
    mockReportError.mockClear();
  });

  describe('should return true', () => {
    const defaultOfferings = {} as Record<string, RedirectParams>;
    defaultOfferings[defaultOfferingId] = RedirectParamsFactory({
      sp2RedirectPercentage: 100,
    });
    const defaultConfig = SP2RedirectConfigFactory({
      offerings: defaultOfferings,
    });
    const defaultRandomPercentage = 100;
    it('uses percentage from config', () => {
      const result = redirectToSp2(
        defaultConfig,
        defaultOfferingId,
        defaultRandomPercentage,
        mockReportError
      );
      expect(result).toBe(true);
      expect(mockReportError).not.toHaveBeenCalled();
    });

    it('uses config default percentage if config not found', () => {
      const result = redirectToSp2(
        defaultConfig,
        'invalidOfferingId',
        defaultRandomPercentage,
        mockReportError
      );
      expect(result).toBe(true);
      expect(mockReportError).toHaveBeenCalled();
    });
  });

  describe('should return false', () => {
    const defaultOfferings = {} as Record<string, RedirectParams>;
    defaultOfferings[defaultOfferingId] = RedirectParamsFactory({
      sp2RedirectPercentage: 0,
    });
    const defaultConfig = SP2RedirectConfigFactory({
      offerings: defaultOfferings,
      defaultRedirectPercentage: 0,
    });
    const defaultRandomPercentage = 1;

    it('uses percentage from config', () => {
      const result = redirectToSp2(
        defaultConfig,
        defaultOfferingId,
        defaultRandomPercentage,
        mockReportError
      );
      expect(result).toBe(false);
      expect(mockReportError).toHaveBeenCalled();
    });

    it('uses config default percentage if config not found', () => {
      const result = redirectToSp2(
        defaultConfig,
        'invalidOfferingId',
        defaultRandomPercentage,
        mockReportError
      );
      expect(result).toBe(false);
      expect(mockReportError).toHaveBeenCalled();
    });
  });

  describe('randomPercentage stays in bound', () => {
    it('returns true even if randomPercentage is more than 100', () => {
      const defaultOfferings = {} as Record<string, RedirectParams>;
      defaultOfferings[defaultOfferingId] = RedirectParamsFactory({
        sp2RedirectPercentage: 100,
      });
      const mockConfig = SP2RedirectConfigFactory({
        offerings: defaultOfferings,
      });

      const result = redirectToSp2(
        mockConfig,
        defaultOfferingId,
        200,
        mockReportError
      );
      expect(result).toBe(true);
    });

    it('returns false even if randomPercentage is less than 1', () => {
      const defaultOfferings = {} as Record<string, RedirectParams>;
      defaultOfferings[defaultOfferingId] = RedirectParamsFactory({
        sp2RedirectPercentage: 0,
      });
      const mockConfig = SP2RedirectConfigFactory({
        offerings: defaultOfferings,
        defaultRedirectPercentage: 0,
      });

      const result = redirectToSp2(
        mockConfig,
        defaultOfferingId,
        0,
        mockReportError
      );
      expect(result).toBe(false);
    });
  });
});
