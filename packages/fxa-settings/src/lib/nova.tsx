/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Temporary while the Nova theme ships behind novaDesignSystem; removed with the flag.

import React from 'react';
import classNames from 'classnames';

/** True when the page carries `data-theme="nova"` (the `novaDesignSystem` flag). */
export const isNovaTheme = () =>
  typeof document !== 'undefined' &&
  document.documentElement.dataset.theme === 'nova';

/**
 * Renders `Nova` under the Nova theme and `Legacy` otherwise. The theme is read
 * on each render; the server sets it before the app loads. Call at module
 * scope, not during render, so the component identity stays stable.
 */
export function withNova<P extends object>(
  Legacy: React.ComponentType<P>,
  Nova: React.ComponentType<P>
) {
  return (props: P) =>
    isNovaTheme() ? <Nova {...props} /> : <Legacy {...props} />;
}

type Svg = React.ComponentType<React.SVGProps<SVGSVGElement>>;

/**
 * Wraps a Nova SVG to append `className` (e.g. a Nova icon color) and, unless
 * `size` is null, render at `size` px (the legacy size) when the caller sets
 * no size.
 */
export const sized =
  (Svg: Svg, className?: string, size: number | null = 24) =>
  (props: React.SVGProps<SVGSVGElement>) => (
    <Svg
      {...(size !== null && { width: size, height: size })}
      {...props}
      className={classNames(props.className, className)}
    />
  );
