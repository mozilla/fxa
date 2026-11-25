/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import mozLogo from '@fxa/shared/assets/images/moz-logo-bw-rgb.svg';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { useClickOutsideEffect } from 'fxa-react/lib/hooks';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useConfig, useFtlMsgResolver, useTheme } from '../../models';
import { useEscKeydownEffect, useLocaleManager } from '../../lib/hooks';
import { getBrowserDefaultLocaleInfo } from '../../lib/locales';
import { ThemePreference } from '../../lib/theme-storage';
import { ReactComponent as GlobeIcon } from '../Icons/nova/globe.min.svg';
import { ReactComponent as SunIcon } from '../Icons/nova/sun.min.svg';
import { ReactComponent as NightModeIcon } from '../Icons/nova/night-mode.min.svg';
import { ReactComponent as DeviceDesktopIcon } from '../Icons/nova/device-desktop.min.svg';

const MOZILLA_URL =
  'https://www.mozilla.org/about/?utm_source=firefox-accounts&utm_medium=Referral';
const BROWSER_DEFAULT_VALUE = 'browser-default';
const PANEL_ID = 'footer-preferences-panel';

// A locale switch remounts the app, so the focus intent must outlive the component.
let refocusAfterLocaleSwitch = false;

const ICON_CLASSES = 'w-4 h-4 shrink-0';
const LINK_CLASSES =
  'transition-standard hover:text-grey-500 hover:underline focus-visible-default rounded-sm nova:text-accent-primary nova:underline nova:hover:text-link-hover';

const LINKS = [
  {
    id: 'app-footer-privacy-notice',
    href: 'https://www.mozilla.org/privacy/websites/',
    testid: 'link-privacy',
    text: 'Website Privacy Notice',
  },
  {
    id: 'app-footer-terms-of-service',
    href: 'https://www.mozilla.org/about/legal/terms/services/',
    testid: 'link-terms',
    text: 'Terms of Service',
  },
  {
    id: 'footer-help-link',
    href: 'https://support.mozilla.org/products/mozilla-account',
    testid: 'link-help',
    text: 'Help',
  },
];

const THEME_OPTIONS: {
  value: ThemePreference;
  ftlId: string;
  fallback: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
}[] = [
  {
    value: 'system',
    ftlId: 'dark-mode-toggle-system',
    fallback: 'System',
    Icon: DeviceDesktopIcon,
  },
  {
    value: 'light',
    ftlId: 'dark-mode-toggle-light',
    fallback: 'Light',
    Icon: SunIcon,
  },
  {
    value: 'dark',
    ftlId: 'dark-mode-toggle-dark',
    fallback: 'Dark',
    Icon: NightModeIcon,
  },
];

export const Footer = ({ className }: { className?: string }) => {
  const config = useConfig();
  const ftlMsgResolver = useFtlMsgResolver();
  const showLocale = !!config.featureFlags?.showLocaleToggle;
  const showTheme = !!config.darkMode?.enabled;

  return (
    <footer
      data-testid="footer"
      className={classNames(
        'w-full flex flex-wrap items-center gap-x-10 gap-y-4 px-6 tablet:px-8 py-4 border-t border-default bg-canvas text-deemphasized text-xs',
        className
      )}
    >
      <div className="flex flex-wrap items-baseline gap-x-10 gap-y-4">
        <LinkExternal
          href={MOZILLA_URL}
          data-testid="link-mozilla"
          className="focus-visible-default rounded-sm outline-offset-2"
        >
          <img
            src={mozLogo}
            alt={ftlMsgResolver.getMsg(
              'app-footer-mozilla-logo-label',
              'Mozilla logo'
            )}
            className="w-18 h-auto dark:invert"
          />
        </LinkExternal>
        <nav aria-label={ftlMsgResolver.getMsg('footer-nav-label', 'Footer')}>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {LINKS.map(({ id, href, testid, text }) => (
              <li key={id}>
                <FtlMsg id={id}>
                  <LinkExternal
                    href={href}
                    data-testid={testid}
                    className={LINK_CLASSES}
                  >
                    {text}
                  </LinkExternal>
                </FtlMsg>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      {(showLocale || showTheme) && (
        <FooterPreferences {...{ showLocale, showTheme }} />
      )}
    </footer>
  );
};

const FooterPreferences = ({
  showLocale,
  showTheme,
}: {
  showLocale: boolean;
  showTheme: boolean;
}) => {
  const [isOpen, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const insideRef = useClickOutsideEffect<HTMLDivElement>(() => setOpen(false));
  const closeAndRefocus = () => {
    if (!isOpen) return;
    setOpen(false);
    buttonRef.current?.focus();
  };
  useEscKeydownEffect(closeAndRefocus);
  useEffect(() => {
    if (refocusAfterLocaleSwitch) {
      refocusAfterLocaleSwitch = false;
      buttonRef.current?.focus();
    }
  }, []);
  const buttonName = !showTheme
    ? { id: 'footer-preferences-button-language', fallback: 'Language' }
    : !showLocale
      ? { id: 'footer-preferences-button-theme', fallback: 'Theme' }
      : { id: 'footer-preferences-button', fallback: 'Language and theme' };

  return (
    <div ref={insideRef} className="relative tablet:ms-auto">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls={PANEL_ID}
        data-testid="footer-preferences-button"
        onClick={() => setOpen(!isOpen)}
        className="inline-flex items-center gap-2 min-h-[2.25rem] px-3 rounded-full border border-interactive bg-box text-default text-xs focus-visible-default"
      >
        {showLocale && (
          <GlobeIcon aria-hidden="true" className={ICON_CLASSES} />
        )}
        <FtlMsg id={buttonName.id}>
          <span className="sr-only">{buttonName.fallback}</span>
        </FtlMsg>
        {showLocale && <CurrentLocaleName />}
        {showLocale && showTheme && <span aria-hidden="true">·</span>}
        {showTheme && <CurrentTheme showLabel={!showLocale} />}
      </button>
      {isOpen && (
        <div
          id={PANEL_ID}
          data-testid={PANEL_ID}
          className="absolute bottom-full mb-3 start-0 tablet:start-auto tablet:end-0 z-10 w-72 max-w-[calc(100vw-3rem)] p-4 flex flex-col gap-3 rounded-3xl border border-default bg-box text-default shadow-md"
        >
          {showLocale && <LanguageSelect />}
          {showTheme && <ThemeRadioGroup />}
        </div>
      )}
    </div>
  );
};

const CurrentLocaleName = () => {
  const { currentLocale, availableLocales } = useLocaleManager();
  const locale = availableLocales.find(({ code }) => code === currentLocale);
  return (
    <span lang={currentLocale}>{locale?.nativeName || currentLocale}</span>
  );
};

const CurrentTheme = ({ showLabel }: { showLabel: boolean }) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const { themePreference } = useTheme();
  const option =
    THEME_OPTIONS.find(({ value }) => value === themePreference) ||
    THEME_OPTIONS[0];
  return (
    <>
      <option.Icon aria-hidden="true" className={ICON_CLASSES} />
      <span className={classNames(!showLabel && 'sr-only')}>
        {ftlMsgResolver.getMsg(option.ftlId, option.fallback)}
      </span>
    </>
  );
};

const LanguageSelect = () => {
  const ftlMsgResolver = useFtlMsgResolver();
  const {
    currentLocale,
    availableLocales,
    switchLocale,
    clearLocalePreference,
    isUsingBrowserDefault,
    isLoading,
  } = useLocaleManager();

  const handleChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = event.target.value;
    if (newLocale === BROWSER_DEFAULT_VALUE) {
      refocusAfterLocaleSwitch = true;
      await clearLocalePreference();
    } else if (newLocale && newLocale !== currentLocale) {
      refocusAfterLocaleSwitch = true;
      await switchLocale(newLocale);
    }
  };

  // Same as LocaleToggle: with no stored choice, show the browser locale.
  const currentValue = isUsingBrowserDefault
    ? getBrowserDefaultLocaleInfo()?.code || currentLocale
    : currentLocale;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="footer-locale-select" className="text-xs font-semibold">
        {ftlMsgResolver.getMsg('locale-toggle-select-label', 'Select language')}
      </label>
      <select
        id="footer-locale-select"
        data-testid="footer-locale-select"
        value={currentValue}
        onChange={handleChange}
        disabled={isLoading}
        className="w-full h-10 px-3 rounded-xl border border-interactive bg-box text-default text-sm focus-visible-default disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value={BROWSER_DEFAULT_VALUE}>
          {ftlMsgResolver.getMsg(
            'locale-toggle-browser-default',
            'Browser default'
          )}
        </option>
        {availableLocales.map((locale) => (
          <option key={locale.code} value={locale.code} lang={locale.code}>
            {locale.nativeName}
            {locale.nativeName !== locale.name && ` (${locale.name})`}
          </option>
        ))}
      </select>
    </div>
  );
};

const ThemeRadioGroup = () => {
  const ftlMsgResolver = useFtlMsgResolver();
  const { themePreference, setThemePreference } = useTheme();

  return (
    <fieldset data-testid="footer-theme" className="flex flex-col gap-2">
      <legend className="text-xs font-semibold">
        {ftlMsgResolver.getMsg('footer-theme-legend', 'Theme')}
      </legend>
      <div className="inline-flex self-start p-0.5 gap-0.5 rounded-full border border-interactive">
        {THEME_OPTIONS.map(({ value, ftlId, fallback, Icon }) => (
          <label
            key={value}
            className={classNames(
              'inline-flex items-center gap-1.5 min-h-[2rem] px-3 rounded-full cursor-pointer text-xs focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus',
              themePreference === value &&
                'bg-blue-500 text-white font-semibold nova:bg-accent-primary nova:text-nav-selected'
            )}
          >
            <input
              type="radio"
              name="footer-theme"
              value={value}
              className="sr-only"
              checked={themePreference === value}
              onChange={() => setThemePreference(value)}
              data-testid={`footer-theme-${value}`}
            />
            <Icon aria-hidden="true" className={ICON_CLASSES} />
            {ftlMsgResolver.getMsg(ftlId, fallback)}
          </label>
        ))}
      </div>
    </fieldset>
  );
};

export default Footer;
