/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface ColorRGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

const DEFAULT_COLOR = 'text-grey-400';
const HEX_OR_RGB_REGEX =
  /#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\([^)]+\)|rgba\([^)]+\)/g;
const WCAG_AA_CONTRAST = 4.5;

export const TEXT_COLORS = {
  'text-white': { r: 255, g: 255, b: 255 },
  'text-grey-400': { r: 109, g: 109, b: 110 },
  'text-grey-600': { r: 50, g: 49, b: 60 },
};

function extractColorsFromGradient(gradient: string): string[] {
  return gradient.match(HEX_OR_RGB_REGEX) || [];
}

/**
 * Determines the optimal text color class to use over a background color based on WCAG AA contrast ratios.
 * @param cssBackgroundValue CSS background value (solid color or gradient)
 * @returns text color class name (e.g., 'text-grey-400', 'text-grey-600', 'text-white')
 */
export function getTextColorClassName(cssBackgroundValue: string): string {
  if (cssBackgroundValue.includes('gradient')) {
    return calculateGradientContrast(cssBackgroundValue);
  }
  return calculateSolidColorContrast(cssBackgroundValue);
}

/**
 * Checks if the given text color meets WCAG AA contrast requirements against the background color.
 * @param backgroundColorValue CSS background color value (solid color or gradient) - should be non-empty
 * @param textColorValue CSS text color value (solid color) - should be non-empty
 * @returns true if contrast meets WCAG AA requirements (4.5:1), false otherwise
 */
export function hasSufficientContrast(
  backgroundColorValue: string,
  textColorValue: string
): boolean {
  if (!backgroundColorValue.trim() || !textColorValue.trim()) {
    return true; // Default
  }

  const backgroundLuminance = getBackgroundLuminance(backgroundColorValue);
  const textColor = parseColor(textColorValue);
  const textLuminance = calculateLuminance(
    textColor.r,
    textColor.g,
    textColor.b
  );

  const contrastRatio = calculateContrastRatio(
    backgroundLuminance,
    textLuminance
  );
  return contrastRatio >= WCAG_AA_CONTRAST;
}

function getBackgroundLuminance(cssBackgroundValue: string): number {
  if (cssBackgroundValue.includes('gradient')) {
    const colorMatches = extractColorsFromGradient(cssBackgroundValue);
    if (colorMatches.length === 0) {
      return calculateLuminance(255, 255, 255); // default to white
    }
    const effectiveColor = blendColorsWithAlpha(colorMatches);
    return calculateLuminance(
      effectiveColor.r,
      effectiveColor.g,
      effectiveColor.b
    );
  } else {
    const colorRgba = parseColor(cssBackgroundValue);
    const blendedColor = blendWithWhiteBackground(colorRgba);
    return calculateLuminance(blendedColor.r, blendedColor.g, blendedColor.b);
  }
}

function calculateGradientContrast(gradient: string): string {
  // Extract colors from gradient
  const colorMatches = extractColorsFromGradient(gradient);
  if (colorMatches.length === 0) {
    return DEFAULT_COLOR;
  }
  const effectiveColor = blendColorsWithAlpha(colorMatches);
  const backgroundLuminance = calculateLuminance(
    effectiveColor.r,
    effectiveColor.g,
    effectiveColor.b
  );

  return getTextColorForLuminance(backgroundLuminance);
}

function calculateSolidColorContrast(color: string): string {
  const colorRgba = parseColor(color);
  // Blend with white background (assuming white page background)
  const blendedColor = blendWithWhiteBackground(colorRgba);
  const backgroundLuminance = calculateLuminance(
    blendedColor.r,
    blendedColor.g,
    blendedColor.b
  );

  return getTextColorForLuminance(backgroundLuminance);
}

function getTextColorForLuminance(backgroundLuminance: number): string {
  // Calculate luminance for each text color option
  const whiteLuminance = calculateLuminance(
    TEXT_COLORS['text-white'].r,
    TEXT_COLORS['text-white'].g,
    TEXT_COLORS['text-white'].b
  );
  const medGreyLuminance = calculateLuminance(
    TEXT_COLORS['text-grey-400'].r,
    TEXT_COLORS['text-grey-400'].g,
    TEXT_COLORS['text-grey-400'].b
  );
  const darkGreyLuminance = calculateLuminance(
    TEXT_COLORS['text-grey-600'].r,
    TEXT_COLORS['text-grey-600'].g,
    TEXT_COLORS['text-grey-600'].b
  );

  // Calculate contrast ratios
  const whiteContrast = calculateContrastRatio(
    whiteLuminance,
    backgroundLuminance
  );
  const medGreyContrast = calculateContrastRatio(
    medGreyLuminance,
    backgroundLuminance
  );
  const darkGreyContrast = calculateContrastRatio(
    darkGreyLuminance,
    backgroundLuminance
  );

  // Prefer text-grey-400 if it meets WCAG AA
  // Note 4.5 is for text elements, but non-text elements need a 3:1 ratio to pass.
  // We'll err on the side of caution anyway since gradients BG colors are estimates.
  if (medGreyContrast >= WCAG_AA_CONTRAST) {
    return 'text-grey-400';
  }
  if (whiteContrast >= WCAG_AA_CONTRAST) {
    return 'text-white';
  }
  if (darkGreyContrast >= WCAG_AA_CONTRAST) {
    return 'text-grey-600';
  }

  // If all values fail AA contrast, we want to use text-grey-400, but if
  // contrast value for it is terrible (2.25:1 or less), use the next best one.
  if (medGreyContrast < WCAG_AA_CONTRAST / 2) {
    const bestContrast = Math.max(
      whiteContrast,
      medGreyContrast,
      darkGreyContrast
    );
    if (bestContrast === whiteContrast) {
      return 'text-white';
    }
    if (bestContrast === darkGreyContrast) {
      return 'text-grey-600';
    }
  }
  return 'text-grey-400';
}

export function parseColor(color: string): ColorRGBA {
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
        a: 1,
      };
    }
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
      a: 1,
    };
  }

  // Handle rgb/rgba colors
  const rgbMatch = color.match(/rgba?\(([^)]+)\)/);
  if (rgbMatch) {
    const values = rgbMatch[1].split(',').map((v) => parseFloat(v.trim()));
    return {
      r: values[0] || 0,
      g: values[1] || 0,
      b: values[2] || 0,
      a: values[3] !== undefined ? values[3] : 1,
    };
  }
  // Default to white BG color if BG color can't be parsed
  return { r: 255, g: 255, b: 255, a: 1 };
}

export function calculateLuminance(r: number, g: number, b: number): number {
  // Convert RGB to relative luminance using the formula for sRGB
  const normalize = (c: number) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };

  return 0.2126 * normalize(r) + 0.7152 * normalize(g) + 0.0722 * normalize(b);
}

export function calculateContrastRatio(lum1: number, lum2: number): number {
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

function blendColorsWithAlpha(colors: string[]): ColorRGBA {
  // Start with white background (255, 255, 255)
  let result: ColorRGBA = { r: 255, g: 255, b: 255, a: 1 };

  colors.forEach((color) => {
    const colorRgba = parseColor(color);
    // Alpha blending: result = alpha * foreground + (1 - alpha) * background
    result = {
      r: Math.round(colorRgba.a * colorRgba.r + (1 - colorRgba.a) * result.r),
      g: Math.round(colorRgba.a * colorRgba.g + (1 - colorRgba.a) * result.g),
      b: Math.round(colorRgba.a * colorRgba.b + (1 - colorRgba.a) * result.b),
      a: 1,
    };
  });

  return result;
}

function blendWithWhiteBackground(color: ColorRGBA): ColorRGBA {
  return {
    r: Math.round(color.r * color.a + 255 * (1 - color.a)),
    g: Math.round(color.g * color.a + 255 * (1 - color.a)),
    b: Math.round(color.b * color.a + 255 * (1 - color.a)),
    a: 1,
  };
}
