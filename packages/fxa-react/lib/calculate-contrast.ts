/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface ColorRGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

const HEX_OR_RGB_REGEX =
  /#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\([^)]+\)|rgba\([^)]+\)/g;
const WCAG_AA_CONTRAST = 4.5;
const DEFAULT_TEXT_COLOR: TextColorOption = 'text-grey-400';

export const TEXT_COLORS = {
  'text-white': { r: 255, g: 255, b: 255 },
  'text-grey-400': { r: 109, g: 109, b: 110 },
  'text-grey-600': { r: 50, g: 49, b: 60 },
  'text-grey-900': { r: 12, g: 12, b: 13 },
};

// map colors to css values
export const TEXT_COLOR_CSS_VALUES: Record<string, string> = {
  'text-white': 'rgb(255, 255, 255)',
  'text-grey-400': 'rgb(109, 109, 110)',
  'text-grey-600': 'rgb(50, 49, 60)',
  'text-grey-900': 'rgb(12, 12, 13)',
};

export type TextColorOption = keyof typeof TEXT_COLORS;
export type ContrastPreference = 'minimum' | 'maximum';

/**
 * Extracts all color values (hex or rgb/rgba) from a CSS gradient string.
 * @param gradient - CSS gradient string (e.g., "linear-gradient(90deg, #fff 0%, #000 100%)")
 * @returns Array of color strings found in the gradient
 */
function extractColorsFromGradient(gradient: string): string[] {
  return gradient.match(HEX_OR_RGB_REGEX) || [];
}

/**
 * Helper function to find the best color from a list based on contrast preference.
 * @param colors Array of colors with their contrast values
 * @param preferLowest If true, returns color with lowest contrast; if false, returns highest
 */
function findBestColor(
  colors: Array<{ color: TextColorOption; contrast: number }>,
  preferLowest: boolean
): TextColorOption {
  const best = colors.reduce((best, current) =>
    preferLowest
      ? current.contrast < best.contrast
        ? current
        : best
      : current.contrast > best.contrast
        ? current
        : best
  );
  return best.color;
}

/**
 * Determines the optimal text color class to use over a background color based on WCAG AA contrast ratios.
 *
 * @param cssBackgroundValue - CSS background value (solid color or gradient)
 * @param preference - Contrast preference strategy:
 *                     - 'minimum': Returns the text color with the least contrast that still passes WCAG AA (4.5:1).
 *                                  Ideal for subtle text like arrows or secondary elements on light backgrounds.
 *                                  Example: grey-400 on white background.
 *                     - 'maximum': Returns the text color with the strongest possible contrast that passes WCAG AA.
 *                                  Ideal for prominent text like buttons or high-emphasis content.
 *                                  Example: white on dark blue, or black on white.
 *                     Defaults to 'minimum'.
 *
 * @returns text color class name (e.g., 'text-grey-400', 'text-grey-600', 'text-white', 'text-grey-900')
 *
 * @example
 * // Arrow on white background - prefer subtle grey
 * getTextColorClassName('#ffffff', 'minimum') // Returns 'text-grey-400'
 *
 * @example
 * // Button text on blue background - prefer maximum contrast
 * getTextColorClassName('#0060DF', 'maximum') // Returns 'text-white'
 *
 * @example
 * // Button text on light background - prefer maximum contrast
 * getTextColorClassName('#ffffff', 'maximum') // Returns 'text-grey-900'
 */
export function getTextColorClassName(
  cssBackgroundValue: string,
  preference: ContrastPreference = 'minimum'
): string {
  if (cssBackgroundValue.includes('gradient')) {
    return calculateGradientContrast(cssBackgroundValue, preference);
  }
  return calculateSolidColorContrast(cssBackgroundValue, preference);
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

/**
 * Calculates the luminance of a background color, handling both solid colors and gradients.
 * For gradients, blends all color stops to get an effective luminance.
 * @param cssBackgroundValue - CSS background value (solid color or gradient)
 * @returns Relative luminance value (0-1)
 */
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

/**
 * Calculates the best text color for a gradient background based on contrast preference.
 * For maximum contrast, uses the darkest gradient stop to ensure readability.
 * For minimum contrast, uses the blended average color for subtler text.
 * @param gradient - CSS gradient string
 * @param preference - Contrast preference ('minimum' or 'maximum')
 * @returns Text color class name
 */
function calculateGradientContrast(
  gradient: string,
  preference: ContrastPreference
): string {
  // Extract colors from gradient
  const colorMatches = extractColorsFromGradient(gradient);
  if (colorMatches.length === 0) {
    // If gradient is empty/malformed, return default text color
    return DEFAULT_TEXT_COLOR;
  }

  let backgroundLuminance: number;

  if (preference === 'maximum') {
    // For maximum contrast: use the darkest stop to ensure high contrast text
    // This ensures that if any part of the gradient is dark, we'll choose light text
    const gradientLuminances = colorMatches.map((color) => {
      const colorRgba = parseColor(color);
      const blendedColor = blendWithWhiteBackground(colorRgba);
      return calculateLuminance(blendedColor.r, blendedColor.g, blendedColor.b);
    });
    backgroundLuminance = Math.min(...gradientLuminances);
  } else {
    // For minimum contrast: use the average/blended color for subtle text
    const effectiveColor = blendColorsWithAlpha(colorMatches);
    backgroundLuminance = calculateLuminance(
      effectiveColor.r,
      effectiveColor.g,
      effectiveColor.b
    );
  }

  return getTextColorForLuminance(backgroundLuminance, preference);
}

/**
 * Calculates the best text color for a solid background color based on contrast preference.
 * Blends the color with a white background to account for transparency.
 * @param color - CSS color value (hex or rgb/rgba)
 * @param preference - Contrast preference ('minimum' or 'maximum')
 * @returns Text color class name
 */
function calculateSolidColorContrast(
  color: string,
  preference: ContrastPreference
): string {
  const colorRgba = parseColor(color);
  // Blend with white background (assuming white page background)
  const blendedColor = blendWithWhiteBackground(colorRgba);
  const backgroundLuminance = calculateLuminance(
    blendedColor.r,
    blendedColor.g,
    blendedColor.b
  );

  return getTextColorForLuminance(backgroundLuminance, preference);
}

/**
 * Selects the optimal text color based on background luminance and contrast preference.
 * Filters text colors by WCAG AA compliance and applies the specified preference.
 * @param backgroundLuminance - Relative luminance of the background (0-1)
 * @param preference - Contrast preference ('minimum' or 'maximum')
 * @returns Text color class name that meets accessibility requirements
 */
function getTextColorForLuminance(
  backgroundLuminance: number,
  preference: ContrastPreference
): string {
  // Calculate contrast for all available text colors
  const allColors = Object.keys(TEXT_COLORS) as TextColorOption[];
  const colorContrasts = allColors.map((color) => {
    const rgb = TEXT_COLORS[color];
    const textLuminance = calculateLuminance(rgb.r, rgb.g, rgb.b);
    const contrast = calculateContrastRatio(textLuminance, backgroundLuminance);
    return { color, contrast };
  });

  // Filter colors that pass WCAG AA
  const passingColors = colorContrasts.filter(
    (item) => item.contrast >= WCAG_AA_CONTRAST
  );

  // If we have colors that pass WCAG AA, use preference to select
  if (passingColors.length > 0) {
    if (preference === 'maximum') {
      // Return the color with the highest contrast
      return findBestColor(passingColors, false);
    } else {
      // preference === 'minimum'
      // Return the color with the lowest contrast that still passes WCAG AA
      return findBestColor(passingColors, true);
    }
  }

  // If no colors pass WCAG AA, return the one with the best contrast
  return findBestColor(colorContrasts, false);
}

/**
 * Parses a CSS color string into RGBA components.
 * Supports hex colors (#RGB, #RRGGBB) and rgb/rgba functional notation.
 * @param color - CSS color string (e.g., "#fff", "#ffffff", "rgb(255,255,255)", "rgba(255,255,255,0.5)")
 * @returns ColorRGBA object with r, g, b (0-255) and a (0-1) values. Defaults to white if parsing fails.
 */
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

/**
 * Calculates the relative luminance of an RGB color according to WCAG standards.
 * Uses the sRGB color space formula for accessibility compliance.
 * @param r - Red component (0-255)
 * @param g - Green component (0-255)
 * @param b - Blue component (0-255)
 * @returns Relative luminance value (0-1), where 0 is darkest and 1 is lightest
 */
export function calculateLuminance(r: number, g: number, b: number): number {
  // Convert RGB to relative luminance using the formula for sRGB
  const normalize = (c: number) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };

  return 0.2126 * normalize(r) + 0.7152 * normalize(g) + 0.0722 * normalize(b);
}

/**
 * Calculates the contrast ratio between two luminance values according to WCAG standards.
 * @param lum1 - First luminance value (0-1)
 * @param lum2 - Second luminance value (0-1)
 * @returns Contrast ratio (1-21), where higher values indicate greater contrast
 */
export function calculateContrastRatio(lum1: number, lum2: number): number {
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Blends multiple colors sequentially onto a white background using alpha compositing.
 * Colors are applied in order, with each color blended onto the accumulated result.
 * @param colors - Array of CSS color strings to blend
 * @returns Blended ColorRGBA result with full opacity on white background
 */
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

/**
 * Blends a color with a white background based on its alpha channel.
 * Uses standard alpha compositing to simulate how the color appears over white.
 * @param color - ColorRGBA object with alpha transparency
 * @returns ColorRGBA object with the color blended onto white, with full opacity
 */
function blendWithWhiteBackground(color: ColorRGBA): ColorRGBA {
  return {
    r: Math.round(color.r * color.a + 255 * (1 - color.a)),
    g: Math.round(color.g * color.a + 255 * (1 - color.a)),
    b: Math.round(color.b * color.a + 255 * (1 - color.a)),
    a: 1,
  };
}
