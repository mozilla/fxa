/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import classNames from 'classnames';
import {
  getTextColorClassName,
  TEXT_COLOR_CSS_VALUES,
} from 'fxa-react/lib/calculate-contrast';

export type CmsButtonType = {
  color?: string;
  text?: string;
};

/**
 * Props for the CmsButtonWithFallback component.
 * Extends all standard HTML button attributes.
 */
interface CmsButtonWithFallbackProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The color or gradient to use for CMS styling. When provided, the button will use
   * CMS-specific classes and CSS custom properties for styling.
   * If not provided or falsy, the button will use default styling.
   *
   * Supports:
   * - Solid colors: "#592ACB", "rgb(89, 42, 203)", etc.
   * - CSS gradients: "linear-gradient(90deg, #592ACB 0%, #FF4F5E 100%)"
   *
   * Note: Text color is automatically adjusted based on WCAG contrast requirements
   * for both solid colors and gradients. For gradients, the effective color is
   * calculated by blending all gradient color stops.
   */
  buttonColor?: string;

  /**
   * The text to display in the button. Takes precedence over children.
   * If neither buttonText nor children are provided, defaults to "Continue".
   */
  buttonText?: string;
}

/**
 * A drop-in replacement for HTML button elements that supports CMS styling.
 *
 * This component automatically switches between default and CMS button styles
 * based on whether a `buttonColor` is provided. When `buttonColor` is set,
 * it applies CMS-specific CSS classes and custom properties for consistent
 * theming across CMS-integrated pages.
 *
 * The `className` property is applied as `cta-primary-cms cta-xl` when
 * `buttonColor` is provided otherwise it falls back to `cta-primary cta-xl` + passed in value
 *
 * @example
 * // Default button (no CMS styling)
 * <CmsButtonWithFallback type="submit" disabled={false}>
 *   Continue
 * </CmsButtonWithFallback>
 *
 * @example
 * // CMS-styled button with solid color
 * <CmsButtonWithFallback
 *   type="submit"
 *   buttonColor="#592ACB"
 *   buttonText="Continue with CMS"
 *   disabled={false}
 * />
 *
 * @example
 * // CMS-styled button with gradient
 * <CmsButtonWithFallback
 *   type="submit"
 *   buttonColor="linear-gradient(90deg, #592ACB 0%, #FF4F5E 100%)"
 *   buttonText="Continue with Gradient"
 *   disabled={false}
 * />
 *
 * @example
 * // With custom props
 * <CmsButtonWithFallback
 *   onClick={handleClick}
 *   className="custom-class"
 *   data-testid="submit-button"
 *   buttonColor={cmsButton?.color}
 * >
 *   Submit Form
 * </CmsButtonWithFallback>
 */
const CmsButtonWithFallback: React.FC<CmsButtonWithFallbackProps> = ({
  buttonColor,
  buttonText,
  className = '',
  style,
  children,
  disabled,
  ...rest
}) => {
  // Check if buttonColor is a gradient
  const isGradient = buttonColor?.toLowerCase().includes('gradient');

  // Determines the styles to apply based on isCms state
  const getStyle = () => {
    if (buttonColor) {
      const textColorClass = getTextColorClassName(buttonColor, 'maximum');
      // Map textColorClass to actual CSS color value
      const mappedTextColor =
        TEXT_COLOR_CSS_VALUES[textColorClass] || 'rgb(12, 12, 13)';
      const textColorStyle = {
        color: mappedTextColor,
      };
      if (isGradient) {
        // For gradients, use backgroundImage
        // Border is handled by CSS (removed in normal mode, added back for HCM)
        // Use default blue focus outline (same as non-CMS buttons)

        return {
          backgroundImage: buttonColor,
          '--cta-bg': 'transparent',
          '--cta-border': 'transparent',
          '--cta-active': 'transparent',
          '--cta-focus-outline': 'rgb(59, 130, 246)', // Default blue-500; trying to map a color from the gradient can lead to odd results
          ...(disabled && { opacity: '0.5' }),
          ...textColorStyle,
          ...(style || {}),
        } as unknown as React.CSSProperties;
      }

      // For solid colors, use existing logic
      return {
        '--cta-bg': buttonColor,
        '--cta-border': buttonColor,
        '--cta-active': buttonColor,
        '--cta-disabled': buttonColor,
        ...(disabled && { opacity: '0.5' }),
        ...textColorStyle,
        ...(style || {}),
      };
    }
    return style;
  };

  // Determines which classnames to apply
  const getClassName = () => {
    if (buttonColor) {
      return classNames(
        'cta-primary-cms',
        'cta-xl',
        { 'cta-gradient': isGradient },
        className
      );
    }
    return classNames('cta-primary', 'cta-xl', className);
  };

  return (
    <button
      className={getClassName()}
      style={getStyle()}
      disabled={disabled}
      {...rest}
    >
      {buttonText || children || 'Continue'}
    </button>
  );
};

export default CmsButtonWithFallback;
