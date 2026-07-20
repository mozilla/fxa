/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getCmsHeadlineClassName, getCmsHeadlineStyle } from '.';

describe('getCmsHeadlineClassName', () => {
  describe('font size mapping', () => {
    it('returns correct class for default font size', () => {
      const result = getCmsHeadlineClassName('default');
      expect(result).toBe('card-header-cms text-xl');
    });

    it('returns correct class for medium font size', () => {
      const result = getCmsHeadlineClassName('medium');
      expect(result).toBe('card-header-cms text-xxl');
    });

    it('returns correct class for large font size', () => {
      const result = getCmsHeadlineClassName('large');
      expect(result).toBe('card-header-cms text-xxxl');
    });

    it('returns default class when fontSize is undefined', () => {
      const result = getCmsHeadlineClassName();
      expect(result).toBe('card-header-cms text-xl');
    });

    it('returns default class when fontSize is null', () => {
      const result = getCmsHeadlineClassName(null);
      expect(result).toBe('card-header-cms text-xl');
    });
  });

  describe('case insensitivity', () => {
    it('handles uppercase values', () => {
      const result = getCmsHeadlineClassName('MEDIUM');
      expect(result).toBe('card-header-cms text-xxl');
    });

    it('handles mixed case values', () => {
      const result = getCmsHeadlineClassName('Large');
      expect(result).toBe('card-header-cms text-xxxl');
    });
  });

  describe('invalid values', () => {
    it('returns default for unknown font size', () => {
      const result = getCmsHeadlineClassName('extra-large' as any);
      expect(result).toBe('card-header-cms text-xl');
    });
  });

  describe('no extra whitespace', () => {
    it('trims whitespace correctly', () => {
      const result = getCmsHeadlineClassName('medium');
      expect(result).not.toMatch(/\s{2,}/); // No double spaces
      expect(result).not.toMatch(/^\s|\s$/); // No leading/trailing spaces
    });
  });
});

describe('getCmsHeadlineStyle', () => {
  describe('color handling', () => {
    it('returns color style when provided', () => {
      const result = getCmsHeadlineStyle('#592ACB');
      expect(result).toEqual({ color: '#592ACB' });
    });

    it('returns empty object when color is undefined', () => {
      const result = getCmsHeadlineStyle(undefined);
      expect(result).toEqual({});
    });

    it('returns empty object when color is null', () => {
      const result = getCmsHeadlineStyle(null);
      expect(result).toEqual({});
    });

    it('returns empty object when color is empty string', () => {
      const result = getCmsHeadlineStyle('');
      expect(result).toEqual({});
    });
  });

  describe('color format support', () => {
    it('supports hex colors', () => {
      const result = getCmsHeadlineStyle('#FF5733');
      expect(result).toEqual({ color: '#FF5733' });
    });

    it('supports short hex colors', () => {
      const result = getCmsHeadlineStyle('#F00');
      expect(result).toEqual({ color: '#F00' });
    });

    it('supports RGB colors', () => {
      const result = getCmsHeadlineStyle('rgb(255,87,51)');
      expect(result).toEqual({ color: 'rgb(255,87,51)' });
    });

    it('supports RGBA colors', () => {
      const result = getCmsHeadlineStyle('rgba(255,87,51,0.5)');
      expect(result).toEqual({ color: 'rgba(255,87,51,0.5)' });
    });

    it('supports named colors', () => {
      const result = getCmsHeadlineStyle('rebeccapurple');
      expect(result).toEqual({ color: 'rebeccapurple' });
    });

    it('supports HSL colors', () => {
      const result = getCmsHeadlineStyle('hsl(9, 100%, 60%)');
      expect(result).toEqual({ color: 'hsl(9, 100%, 60%)' });
    });
  });

  describe('combined usage', () => {
    it('className and style can be used together', () => {
      const className = getCmsHeadlineClassName('large');
      const style = getCmsHeadlineStyle('#592ACB');

      expect(className).toBe('card-header-cms text-xxxl');
      expect(style).toEqual({ color: '#592ACB' });
    });

    it('works with no customizations', () => {
      const className = getCmsHeadlineClassName();
      const style = getCmsHeadlineStyle();

      expect(className).toBe('card-header-cms text-xl');
      expect(style).toEqual({});
    });
  });
});
