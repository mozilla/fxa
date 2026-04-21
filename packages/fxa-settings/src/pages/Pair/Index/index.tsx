/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, RouteComponentProps, useLocation } from '@reach/router';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import { FtlMsg } from 'fxa-react/lib/utils';
import { usePageViewEvent } from '../../../lib/metrics';
import { useFtlMsgResolver } from '../../../models';
import { useCmsInfoState } from '../../../models/hooks';
import { RelierCmsInfo } from '../../../models/integrations';
import AppLayout from '../../../components/AppLayout';
import CmsButtonWithFallback from '../../../components/CmsButtonWithFallback';
import { REACT_ENTRYPOINT } from '../../../constants';
import GleanMetrics from '../../../lib/glean';
import Banner from '../../../components/Banner';
import ButtonBack from '../../../components/ButtonBack';
import { getBasicAccountData } from '../../../lib/account-storage';
import { Constants } from '../../../lib/constants';
import firefox, { FirefoxCommand } from '../../../lib/channels/firefox';
import qrCodeFirefoxMobile from '../../../components/images/qr_code_firefox_mobile.svg';
import mobileFirefoxIcon from './mobile-ff.svg';
import mobileDownloadIcon from './mobile-download.svg';
import { isSendTabEntrypoint } from '../../../lib/utilities';
import type { PairOrigin } from '../../Signin/utils';
import type { SigninLocationState } from '../../Signin/interfaces';
import type { Integration } from '../../../models';

// Maps the reach-router location.state `origin` set by getSyncNavigate to the
// banner copy shown at the top of the choice screen.
const PAIR_BANNER_FTL: Record<PairOrigin, { id: string; fallback: string }> = {
  signin: {
    id: 'pair-signed-in-successfully',
    fallback: 'Signed in successfully!',
  },
  signup: {
    id: 'pair-account-created-now-syncing',
    fallback: 'Account created. You’re now syncing.',
  },
  'post-verify-set-password': {
    id: 'pair-password-created-now-syncing',
    fallback: 'Password created. You’re now syncing.',
  },
};

type MobileChoice = 'has-mobile' | 'needs-mobile';

const GLEAN_REASON_BY_CHOICE: Record<MobileChoice, string> = {
  'has-mobile': 'has mobile',
  'needs-mobile': 'does not have mobile',
};

type PairView = 'choice' | 'download';

type PairProps = {
  error?: string;
  cmsInfo?: RelierCmsInfo;
  integration?: Integration;
};
export const viewName = 'pair';

const Pair = ({
  error,
  cmsInfo: cmsInfoProp,
  integration,
}: PairProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);
  const ftlMsgResolver = useFtlMsgResolver();
  const localizedQRCodeLabel = ftlMsgResolver.getMsg(
    'pair-qr-code-aria-label',
    'QR code'
  );
  const navigateWithQuery = useNavigateWithQuery();
  const location = useLocation();

  // CMS theming — mirrors the Backbone pair/index.js fetchCmsConfig() flow.
  // Strict parity with Backbone: only Pair/Index is themed; the rest of
  // the React pair flow remains untouched.
  const cmsInfoState = useCmsInfoState();
  const cmsInfo = cmsInfoProp ?? cmsInfoState.data?.cmsInfo;
  const cmsButtonColor = cmsInfo?.shared?.buttonColor;

  const [currentView, setCurrentView] = useState<PairView>('choice');
  const [selectedRadio, setSelectedRadio] = useState<MobileChoice | null>(null);

  const choiceHeaderRef = useRef<HTMLHeadingElement>(null);
  const downloadHeaderRef = useRef<HTMLHeadingElement>(null);

  // Focus management after view transitions
  useEffect(() => {
    if (currentView === 'download') {
      downloadHeaderRef.current?.focus();
    }
  }, [currentView]);

  useEffect(() => {
    // Matches Backbone's beforeRender sequence — runs once on mount.
    // getBasicAccountData() is called inside the effect to avoid creating
    // a new object reference on every render (which would re-trigger this effect).
    const ua = navigator.userAgent;
    const isFirefoxDesktop =
      /Firefox/i.test(ua) && !/FxiOS/i.test(ua) && !/Android/i.test(ua);

    if (!isFirefoxDesktop) {
      navigateWithQuery('/pair/unsupported');
      return;
    }
    const accountData = getBasicAccountData();
    if (!accountData) {
      navigateWithQuery('/connect_another_device', {
        state: { forceView: true },
      });
      return;
    }
    if (!accountData.verified || !accountData.sessionToken) {
      const params = new URLSearchParams({
        context: Constants.FX_DESKTOP_V3_CONTEXT,
        entrypoint: 'fxa:pair',
        service: Constants.SYNC_SERVICE,
      });
      navigateWithQuery(`/signin?${params}`);
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fire Glean view events for the choice flow
  useEffect(() => {
    if (currentView === 'choice') {
      GleanMetrics.cadFireFox.choiceView();
      return;
    }
    GleanMetrics.cadFireFox.view();
  }, [currentView]);

  // Show success banner only on the choice screen (matches Backbone). Drive
  // the banner variant from reach-router location state set by getSyncNavigate
  // — the Backbone-era query params are only read by Backbone /pair now.
  const { origin: pairOrigin } = (location.state ?? {}) as Pick<
    SigninLocationState,
    'origin'
  >;
  const bannerCopy =
    currentView === 'choice' && pairOrigin ? PAIR_BANNER_FTL[pairOrigin] : null;

  const isSendTab = isSendTabEntrypoint(integration?.data.entrypoint);

  // Send the pair_preferences WebChannel command to Firefox.
  // This tells Firefox to open about:preferences#sync and start the pairing flow.
  const openPairPreferences = useCallback(() => {
    firefox.send(FirefoxCommand.PairPreferences, {});
  }, []);

  const handleRadioChange = useCallback((value: MobileChoice) => {
    setSelectedRadio(value);
    GleanMetrics.cadFireFox.choiceEngage({
      event: { reason: GLEAN_REASON_BY_CHOICE[value] },
    });
  }, []);

  const handleChoiceSubmit = useCallback(() => {
    if (!selectedRadio) {
      return;
    }
    GleanMetrics.cadFireFox.choiceSubmit({
      event: { reason: GLEAN_REASON_BY_CHOICE[selectedRadio] },
    });

    if (selectedRadio === 'needs-mobile') {
      setCurrentView('download');
      return;
    }
    openPairPreferences();
  }, [selectedRadio, openPairPreferences]);

  const handleBackButton = useCallback(() => {
    setCurrentView('choice');
    requestAnimationFrame(() => {
      choiceHeaderRef.current?.focus();
    });
  }, []);

  const handleSyncDeviceSubmit = useCallback(() => {
    GleanMetrics.cadFireFox.syncDeviceSubmit();
    openPairPreferences();
  }, [openPairPreferences]);

  if (currentView === 'download') {
    return (
      <AppLayout cmsInfo={cmsInfo}>
        <header className="relative flex items-center">
          <ButtonBack onClick={handleBackButton} />
          <h1
            id="cad-header"
            className="text-grey-400 mb-0 tablet:mb-5 text-base inline-block align-top tablet:mt-0"
          >
            <FtlMsg id="pair-cad-header-v2">Connect another device</FtlMsg>
          </h1>
        </header>
        <FtlMsg id="pair-download-subheader">
          <h2
            ref={downloadHeaderRef}
            id="pair-header-mobile"
            className="card-header focus:outline-none"
            tabIndex={-1}
          >
            Download Firefox for mobile
          </h2>
        </FtlMsg>

        <section>
          {error && (
            <Banner type="error" content={{ localizedHeading: error }} />
          )}
          <FtlMsg id="pair-download-description">
            <p className="text-base mt-2">
              To sync Firefox on your phone or tablet, you first need to
              download Firefox for mobile. Here’s how:
            </p>
          </FtlMsg>
          <ol>
            <li>
              <FtlMsg
                id="pair-download-step-scan-qr"
                vars={{ stepNumber: 1 }}
                elems={{ b: <b /> }}
              >
                <p className="text-base mt-5">
                  <b>Step 1</b>: Download Firefox by scanning this QR code with
                  the camera on your mobile device:
                </p>
              </FtlMsg>
              <img
                src={qrCodeFirefoxMobile}
                className="my-10 mx-auto w-48 h-48"
                alt={localizedQRCodeLabel}
              />
            </li>
            <li>
              <FtlMsg
                id="pair-download-step-continue-sync"
                vars={{ stepNumber: 2 }}
                elems={{ b: <b /> }}
              >
                <p className="text-base mb-5">
                  <b>Step 2</b>: Select “Continue to sync” to sync your Firefox
                  experience on your mobile device.
                </p>
              </FtlMsg>
            </li>
          </ol>

          <div className="flex">
            <FtlMsg id="pair-continue-to-sync-button">
              <CmsButtonWithFallback
                id="start-pairing"
                type="button"
                onClick={handleSyncDeviceSubmit}
                buttonColor={cmsButtonColor}
              >
                Continue to sync
              </CmsButtonWithFallback>
            </FtlMsg>
          </div>
          <p className="mt-5 text-sm text-center">
            <FtlMsg id="pair-not-now-button">
              <Link
                id="pair-not-now"
                className="link-blue"
                to="/settings"
                onClick={() => {
                  GleanMetrics.cadFireFox.notnowSubmit();
                }}
              >
                Not now
              </Link>
            </FtlMsg>
          </p>
        </section>
      </AppLayout>
    );
  }

  return (
    <AppLayout cmsInfo={cmsInfo}>
      {bannerCopy && (
        <Banner
          type="success"
          content={{
            localizedHeading: ftlMsgResolver.getMsg(
              bannerCopy.id,
              bannerCopy.fallback
            ),
          }}
        />
      )}
      {error && <Banner type="error" content={{ localizedHeading: error }} />}
      {isSendTab ? (
        <FtlMsg id="pair-choice-header-send-tab">
          <h1
            ref={choiceHeaderRef}
            id="pair-header"
            data-testid="pair-header"
            className="card-header focus:outline-none"
            tabIndex={-1}
          >
            Download or open Firefox on the device where you want to send tabs
          </h1>
        </FtlMsg>
      ) : (
        <div id="cad-header">
          <h1 className="mb-5 text-grey-400 text-base">
            <FtlMsg id="pair-cad-header-v2">Connect another device</FtlMsg>
          </h1>
          <FtlMsg id="pair-choice-subheader">
            <h2
              ref={choiceHeaderRef}
              id="pair-header"
              data-testid="pair-header"
              className="card-header focus:outline-none"
              tabIndex={-1}
            >
              Sync your Firefox experience
            </h2>
          </FtlMsg>
        </div>
      )}

      <section>
        {!isSendTab && (
          <FtlMsg id="pair-choice-description">
            <p className="my-3 text-base">
              View your saved passwords, tabs, browsing history and more —
              across all your devices.
            </p>
          </FtlMsg>
        )}

        <form noValidate id="form-ask-mobile-status">
          <fieldset>
            <FtlMsg id="pair-choice-legend">
              <legend className="mb-4 mt-3 text-base font-semibold">
                Select an option to continue:
              </legend>
            </FtlMsg>
            <div className="input-radio-wrapper">
              <input
                className="input-radio"
                type="radio"
                id="has-mobile"
                data-testid="has-mobile"
                name="mobile-download"
                checked={selectedRadio === 'has-mobile'}
                onChange={() => handleRadioChange('has-mobile')}
              />
              <label className="input-radio-label" htmlFor="has-mobile">
                <div className="pe-3">
                  <FtlMsg id="pair-choice-has-mobile-title">
                    <strong className="block mb-2 text-base">
                      I already have Firefox for mobile
                    </strong>
                  </FtlMsg>
                  <FtlMsg id="pair-choice-has-mobile-description">
                    <span>
                      Start your sync now if you already have Firefox on your
                      mobile device.
                    </span>
                  </FtlMsg>
                </div>
                <img
                  src={mobileFirefoxIcon}
                  alt=""
                  aria-hidden="true"
                  data-testid="pair-choice-icon-has-mobile"
                  className="w-14 h-14 shrink-0 self-center"
                />
              </label>
            </div>
            <div className="input-radio-wrapper">
              <input
                className="input-radio"
                type="radio"
                id="needs-mobile"
                data-testid="needs-mobile"
                name="mobile-download"
                checked={selectedRadio === 'needs-mobile'}
                onChange={() => handleRadioChange('needs-mobile')}
              />
              <label className="input-radio-label" htmlFor="needs-mobile">
                <div className="pe-3">
                  <FtlMsg id="pair-choice-needs-mobile-title">
                    <strong className="block mb-2 text-base">
                      I don’t have Firefox for mobile
                    </strong>
                  </FtlMsg>
                  <FtlMsg id="pair-choice-needs-mobile-description">
                    <span>
                      Download Firefox on your mobile device, then start your
                      sync.
                    </span>
                  </FtlMsg>
                </div>
                <img
                  src={mobileDownloadIcon}
                  alt=""
                  aria-hidden="true"
                  data-testid="pair-choice-icon-needs-mobile"
                  className="w-14 h-14 shrink-0 self-center"
                />
              </label>
            </div>
          </fieldset>

          <div className="flex mt-6">
            <FtlMsg id="pair-choice-continue-button">
              <CmsButtonWithFallback
                id="set-needs-mobile"
                data-testid="pair-continue-btn"
                type="button"
                disabled={!selectedRadio}
                onClick={handleChoiceSubmit}
                buttonColor={cmsButtonColor}
              >
                Continue
              </CmsButtonWithFallback>
            </FtlMsg>
          </div>
        </form>

        <p className="mt-5 text-sm text-center">
          <FtlMsg id="pair-not-now-button">
            <Link
              id="choice-pair-not-now"
              className="link-blue"
              to="/settings"
              onClick={() => {
                GleanMetrics.cadFireFox.choiceNotnowSubmit();
              }}
            >
              Not now
            </Link>
          </FtlMsg>
        </p>
      </section>
    </AppLayout>
  );
};

export default Pair;
