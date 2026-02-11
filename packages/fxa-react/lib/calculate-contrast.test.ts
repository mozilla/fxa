/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  getTextColorClassName,
  hasSufficientContrast,
  parseColor,
  calculateLuminance,
  calculateContrastRatio,
  TEXT_COLORS,
} from './calculate-contrast';

describe('calculate-contrast', () => {
  describe('getTextColorClassName', () => {
    describe('default color (text-grey-400)', () => {
      it('should return text-grey-400 for light solid colors', () => {
        expect(getTextColorClassName('#ffffff')).toBe('text-grey-400');
        expect(getTextColorClassName('#FAFAFD')).toBe('text-grey-400');
        expect(getTextColorClassName('rgb(255, 255, 255)')).toBe(
          'text-grey-400'
        );
        expect(getTextColorClassName('rgba(255, 240, 255, 1)')).toBe(
          'text-grey-400'
        );
      });
      it('should return text-grey-400 for light gradients', () => {
        expect(
          getTextColorClassName(
            'radial-gradient(circle, rgba(255, 245, 235, 0.8) 0%, rgba(255, 250, 240, 0.6) 100%)'
          )
        ).toBe('text-grey-400');
        expect(
          getTextColorClassName(
            'linear-gradient(135deg, rgba(250, 240, 250, 0.7) 0%, rgba(255, 245, 248, 0.5) 100%)'
          )
        ).toBe('text-grey-400');
      });

      it('should handle semi-transparent colors with alpha blending', () => {
        expect(getTextColorClassName('rgba(0, 0, 0, 0.7)')).toBe('text-white');
        expect(getTextColorClassName('rgba(255, 255, 255, 0.1)')).toBe(
          'text-grey-400'
        );
      });

      it('should handle gradients with no extractable colors', () => {
        expect(
          getTextColorClassName('linear-gradient(to right, transparent)')
        ).toBe('text-grey-400');
      });
    });

    describe('white text (text-white)', () => {
      it('should return text-white for dark solid colors that have poor contrast with grey', () => {
        expect(getTextColorClassName('#8B4000')).toBe('text-white');
        expect(getTextColorClassName('#000080')).toBe('text-white');
        expect(getTextColorClassName('#000000')).toBe('text-white');
        expect(getTextColorClassName('#240005')).toBe('text-white');
        expect(getTextColorClassName('#4B0082')).toBe('text-white');
        expect(getTextColorClassName('rgb(0, 0, 0)')).toBe('text-white');
        expect(getTextColorClassName('rgba(0, 0, 0, 1)')).toBe('text-white');
      });

      it('should return text-white when all 3 fail contrast', () => {
        expect(getTextColorClassName('#808000')).toBe('text-white');
      });

      it('should return text-white for medium colors that have poor contrast with grey', () => {
        expect(getTextColorClassName('#7037d4')).toBe('text-white');
        // Using a test background color instead of MOCK_CMS_INFO
        expect(getTextColorClassName('#6D37D1')).toBe('text-white');
      });

      it('should return text-white for dark gradients', () => {
        expect(
          getTextColorClassName(
            'linear-gradient(135deg, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 1) 100%)'
          )
        ).toBe('text-white');
        expect(
          getTextColorClassName(
            'radial-gradient(circle at center, rgba(139, 64, 0, 1) 0%, rgba(101, 67, 33, 1) 100%)'
          )
        ).toBe('text-white');
        expect(
          getTextColorClassName(
            'linear-gradient(135deg, rgba(75, 0, 130, 1) 0%, rgba(72, 61, 139, 1) 100%)'
          )
        ).toBe('text-white');
        expect(
          getTextColorClassName(
            'radial-gradient(circle, rgba(0, 0, 128, 1) 0%, rgba(25, 25, 112, 1) 100%)'
          )
        ).toBe('text-white');
        expect(
          getTextColorClassName(
            'linear-gradient(135deg, rgba(128, 128, 0, 1) 0%, rgba(85, 107, 47, 1) 100%)'
          )
        ).toBe('text-white');
      });
    });

    describe('dark grey text (text-grey-600)', () => {
      it('should return text-grey-600 when grey-400 and white fail but grey-600 passes', () => {
        expect(getTextColorClassName('#37d44c')).toBe('text-grey-600');
        expect(
          getTextColorClassName(
            'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)'
          )
        ).toBe('text-grey-600');
        expect(
          getTextColorClassName(
            'radial-gradient(ellipse at top, rgba(250, 100, 210, 1) 0%, rgba(220, 200, 240, 1) 100%)'
          )
        ).toBe('text-grey-600');
      });
    });
  });

  describe('parseColor', () => {
    it('should parse hex colors correctly', () => {
      expect(parseColor('#ffffff')).toEqual({ r: 255, g: 255, b: 255, a: 1 });
      expect(parseColor('#000000')).toEqual({ r: 0, g: 0, b: 0, a: 1 });
      expect(parseColor('#fff')).toEqual({ r: 255, g: 255, b: 255, a: 1 });
      expect(parseColor('#abc')).toEqual({ r: 170, g: 187, b: 204, a: 1 });
      expect(parseColor('#6D37D1')).toEqual({ r: 109, g: 55, b: 209, a: 1 });
      expect(parseColor('#FFA500')).toEqual({ r: 255, g: 165, b: 0, a: 1 });
    });

    it('should parse rgb colors correctly', () => {
      expect(parseColor('rgb(255, 255, 255)')).toEqual({
        r: 255,
        g: 255,
        b: 255,
        a: 1,
      });
      expect(parseColor('rgb(190, 55, 209)')).toEqual({
        r: 190,
        g: 55,
        b: 209,
        a: 1,
      });
      expect(parseColor('rgb(0, 0, 0)')).toEqual({ r: 0, g: 0, b: 0, a: 1 });
    });

    it('should parse rgba colors correctly', () => {
      expect(parseColor('rgba(255, 255, 255, 0.5)')).toEqual({
        r: 255,
        g: 255,
        b: 255,
        a: 0.5,
      });
      expect(parseColor('rgba(0, 0, 0, 0.7)')).toEqual({
        r: 0,
        g: 0,
        b: 0,
        a: 0.7,
      });
      expect(parseColor('rgba(50, 100, 150, 0.9)')).toEqual({
        r: 50,
        g: 100,
        b: 150,
        a: 0.9,
      });
    });

    it('should return default white for invalid colors', () => {
      expect(parseColor('invalid')).toEqual({ r: 255, g: 255, b: 255, a: 1 });
      expect(parseColor('')).toEqual({ r: 255, g: 255, b: 255, a: 1 });
    });
  });

  describe('calculateLuminance', () => {
    it('should calculate correct luminance for black and white', () => {
      expect(calculateLuminance(0, 0, 0)).toBeCloseTo(0, 5);
      expect(calculateLuminance(255, 255, 255)).toBeCloseTo(1, 5);
    });

    it('should calculate luminance for greys', () => {
      // The values are from a calculator, this just confirms that our expectations match
      expect(
        calculateLuminance(
          TEXT_COLORS['text-grey-400'].r,
          TEXT_COLORS['text-grey-400'].g,
          TEXT_COLORS['text-grey-400'].b
        )
      ).toBeCloseTo(0.1531, 2);
      expect(
        calculateLuminance(
          TEXT_COLORS['text-grey-600'].r,
          TEXT_COLORS['text-grey-600'].g,
          TEXT_COLORS['text-grey-600'].b
        )
      ).toBeCloseTo(0.032, 2);
    });
  });

  describe('calculateContrastRatio', () => {
    it('should calculate correct contrast ratio for black and white', () => {
      const blackLuminance = 0;
      const whiteLuminance = 1;
      expect(
        calculateContrastRatio(blackLuminance, whiteLuminance)
      ).toBeCloseTo(21, 1);
    });

    it('should calculate contrast ratio symmetrically', () => {
      const lum1 = 0.2;
      const lum2 = 0.8;
      expect(calculateContrastRatio(lum1, lum2)).toEqual(
        calculateContrastRatio(lum2, lum1)
      );
    });

    it('should meet WCAG AA standard for good contrast', () => {
      // White text on dark background should have contrast >= 4.5
      const darkBackgroundLuminance = 0.1;
      const whiteLuminance = 1;
      const contrast = calculateContrastRatio(
        whiteLuminance,
        darkBackgroundLuminance
      );
      expect(contrast).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe('hasSufficientContrast', () => {
    describe('with white text (#ffffff)', () => {
      it('should return true for dark backgrounds that meet WCAG AA contrast', () => {
        expect(hasSufficientContrast('#000000', '#ffffff')).toBe(true);
        expect(hasSufficientContrast('#333333', '#ffffff')).toBe(true);
        expect(hasSufficientContrast('#4B0082', '#ffffff')).toBe(true);
        expect(hasSufficientContrast('rgb(0, 0, 0)', '#ffffff')).toBe(true);
      });

      it('should return false for light backgrounds that fail WCAG AA contrast', () => {
        expect(hasSufficientContrast('#ffffff', '#ffffff')).toBe(false);
        expect(hasSufficientContrast('#ffff00', '#ffffff')).toBe(false);
        expect(
          hasSufficientContrast('rgba(255, 255, 255, 0.9)', '#ffffff')
        ).toBe(false);
      });

      it('should handle gradients correctly', () => {
        expect(
          hasSufficientContrast(
            'linear-gradient(135deg, #000000 0%, #333333 100%)',
            '#ffffff'
          )
        ).toBe(true);
        expect(
          hasSufficientContrast(
            'radial-gradient(ellipse at center, #ffffff 0%, #f0f0f0 100%)',
            '#ffffff'
          )
        ).toBe(false);
      });
    });

    describe('with dark text', () => {
      it('should return true for light backgrounds that meet WCAG AA contrast', () => {
        expect(hasSufficientContrast('#ffffff', '#000000')).toBe(true);
        expect(hasSufficientContrast('#f8f8f8', '#333333')).toBe(true);
        expect(hasSufficientContrast('#ffff99', '#000080')).toBe(true);
      });

      it('should return false for dark backgrounds that fail WCAG AA contrast', () => {
        expect(hasSufficientContrast('#000000', '#000000')).toBe(false);
        expect(hasSufficientContrast('#333333', '#666666')).toBe(false);
      });
    });

    it('should handle colors near the 4.5:1 threshold correctly', () => {
      expect(hasSufficientContrast('#767676', '#ffffff')).toBe(true); // Just above 4.5:1 ratio
      expect(hasSufficientContrast('#777777', '#ffffff')).toBe(false); // Just below 4.5:1 ratio
    });

    describe('with transparent colors', () => {
      it('should handle alpha values correctly by blending with white background', () => {
        expect(hasSufficientContrast('rgba(0, 0, 0, 0.8)', '#ffffff')).toBe(
          true
        );
        expect(hasSufficientContrast('rgba(0, 0, 0, 0.2)', '#ffffff')).toBe(
          false
        );
      });
    });

    it('should handle an empty string', () => {
      expect(hasSufficientContrast('', '#ffffff')).toBe(true);
      expect(hasSufficientContrast('#000000', '')).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty string', () => {
      expect(getTextColorClassName('')).toBe('text-grey-400');
    });

    it('should handle malformed gradient', () => {
      expect(getTextColorClassName('linear-gradient(malformed)')).toBe(
        'text-grey-400'
      );
    });
  });
});
