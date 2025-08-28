/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import classNames from 'classnames';
import { hasSufficientContrast } from 'fxa-react/lib/calculate-contrast';

export type CmsButtonType = {
  color?: string;
  text?: string;
}

/**
 * Props for the CmsButtonWithFallback component.
 * Extends all standard HTML button attributes.
 */
interface CmsButtonWithFallbackProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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
  ...rest
}) => {
  // Determine if this should be a CMS button based on buttonColor presence
  const isCms = Boolean(buttonColor);

  // Apply CMS-specific styles if buttonColor is provided
  const cmsStyles = isCms
    ? ({
        '--cta-bg': buttonColor,
        '--cta-border': buttonColor,
        '--cta-active': buttonColor,
        '--cta-disabled': `${buttonColor}60`,
        ...style,
      } as any)
    : style || {};

  return (
    <button
      className={classNames(
        isCms ? 'cta-primary-cms' : 'cta-primary',
        'cta-xl',
        {
          // add a text-shadow if the CMS background color does not meet color contrast
          // standards, as our CTA button text is always white
          'text-shadow-cms': isCms && buttonColor && !hasSufficientContrast(buttonColor.trim(), '#ffffff'),
        },
        className
      )}
      style={cmsStyles}
      {...rest}
    >
      {buttonText || children || 'Continue'}
    </button>
  );
};

export default CmsButtonWithFallback;
