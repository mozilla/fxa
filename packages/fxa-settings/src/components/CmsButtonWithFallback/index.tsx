/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import classNames from 'classnames';
import {
  hasSufficientContrast,
  TEXT_COLORS,
} from 'fxa-react/lib/calculate-contrast';
import React from 'react';

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
   * The color to use for CMS styling. When provided, the button will use
   * CMS-specific classes and CSS custom properties for styling.
   * If not provided or falsy, the button will use default styling.
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
 * // CMS-styled button
 * <CmsButtonWithFallback
 *   type="submit"
 *   buttonColor="#592ACB"
 *   buttonText="Continue with CMS"
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
  // Determine the default color of a disabled button
  const disabledButtonColor = buttonColor ? `${buttonColor}60` : undefined;

  // Determines whether to use a dark or light text color depending on contrast
  const getTextColor = () => {
    const { r, g, b } = TEXT_COLORS['text-grey-600'];
    const defaultTextColor = '#ffffff';

    if (
      disabled &&
      disabledButtonColor &&
      !hasSufficientContrast(disabledButtonColor, defaultTextColor)
    ) {
      return { color: `rgb(${r} ${g} ${b} / .5)` };
    }

    if (
      !disabled &&
      buttonColor &&
      !hasSufficientContrast(buttonColor, defaultTextColor)
    ) {
      return { color: `rgb(${r} ${g} ${b} / var(--tw-text-opacity, 1))` };
    }

    return {};
  };

  // Determines the styles to apply based on isCms state
  const getStyle = () => {
    if (buttonColor) {
      return {
        '--cta-bg': buttonColor,
        '--cta-border': buttonColor,
        '--cta-active': buttonColor,
        '--cta-disabled': disabledButtonColor,
        ...getTextColor(),
        ...(style || {}),
      };
    }
    return style;
  };

  // Determines which classnames to apply
  const getClassName = () => {
    return buttonColor
      ? classNames('cta-primary-cms', 'cta-xl', className)
      : classNames('cta-primary', 'cta-xl', className);
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
