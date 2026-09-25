/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { isPairGleanReason } from 'fxa-shared/metrics/glean/pair-reasons';
import { Link, useLocation } from 'react-router';
import { UseFxAStatusResult, useNavigateWithQuery } from '../../../lib/hooks';
import { FtlMsg } from 'fxa-react/lib/utils';
import { usePageViewEvent } from '../../../lib/metrics';
import { useFtlMsgResolver } from '../../../models';
import { useCmsInfoState, useConfig } from '../../../models/hooks';
import { RelierCmsInfo } from '../../../models/integrations';
import AppLayout from '../../../components/AppLayout';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import CmsButtonWithFallback from '../../../components/CmsButtonWithFallback';
import { REACT_ENTRYPOINT } from '../../../constants';
import GleanMetrics from '../../../lib/glean';
import Banner from '../../../components/Banner';
import ButtonBack from '../../../components/ButtonBack';
import { Constants } from '../../../lib/constants';
import firefox, {
  buildSyncOAuthSearch,
  FirefoxCommand,
  SignedInUser,
} from '../../../lib/channels/firefox';
import { hardNavigate } from 'fxa-react/lib/utils';
import QRCode from '../../../components/QRCode';
import firefoxLogo from './firefox-logo-browser.svg';
import mobileFirefoxIcon from './mobile-ff.svg';
import mobileDownloadIcon from './mobile-download.svg';
import {
  buildPairingDownloadUrl,
  detectDevice,
  Devices,
  isIosSafari,
  isSendTabEntrypoint,
} from '../../../lib/utilities';
import {
  buildConnectHintUrl,
  buildPairUrl,
  parsePairingHash,
} from '../../../lib/pairing/pair-url';
import { getPairingChannelHashParams } from '../../../lib/pairing-channel-params';
import {
  isPairingV2Enabled,
  isPairingV2RolledOut,
} from '../../../lib/pairing/v2-gate';
import {
  getAttemptStorage,
  HandoffPlan,
  planPairingHandoff,
} from '../../../lib/pairing/handoff';
import {
  PAIR_FLOW_ENTRYPOINT,
  pickPairingAttribution,
  pickPairingAttributionFromData,
  stashPairingAttribution,
} from '../../../lib/pairing-attribution';
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

/**
 * The pairing channel the authority encodes into its QR code, handed to the
 * supplicant flow as router state.
 */
export type PairingChannelInfo = {
  channelId: string;
  channelKey: string;
  version: '1' | '2';
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
  fxaStatusResult: UseFxAStatusResult;
  /** @internal Seam for Storybook, which cannot set a user agent. Defaults to
   * the running browser. */
  device?: Devices;
};
export const viewName = 'pair';

const isVerifiedUser = (user?: SignedInUser) =>
  !!(user?.sessionToken && user.verified);

// Full reload: `useIntegration` is not keyed on location, so only a fresh page
// load rebuilds it as a PairingAuthorityIntegration.
const goToScanQr = () => hardNavigate('/pair/authority/scan_qr', {}, true);

const Pair = ({
  error,
  cmsInfo: cmsInfoProp,
  integration,
  fxaStatusResult,
  device: deviceProp,
}: PairProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);
  const ftlMsgResolver = useFtlMsgResolver();
  const localizedQRCodeLabel = ftlMsgResolver.getMsg(
    'pair-qr-code-aria-label',
    'QR code'
  );
  const config = useConfig();
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
  // Hide the choice screen until the WebChannel decision resolves.
  const [bootstrapping, setBootstrapping] = useState(true);

  const choiceHeaderRef = useRef<HTMLHeadingElement>(null);
  const downloadHeaderRef = useRef<HTMLHeadingElement>(null);

  // Attribution params to carry into the pairing flow (FXA-14132). Sourced from
  // the integration so it matches what this page's own Glean events report;
  // falls back to the URL when no integration is supplied (tests, stories).
  const pairingAttribution = useMemo(() => {
    const fromUrl = pickPairingAttribution(location.search);
    const picked = integration?.data
      ? pickPairingAttributionFromData(integration.data)
      : fromUrl;
    // `IntegrationFactory` drops an `entryPoint`-only value, so fall back to the
    // URL, which keeps it, before reaching for the default.
    return {
      ...picked,
      entrypoint:
        picked.entrypoint || fromUrl.entrypoint || PAIR_FLOW_ENTRYPOINT,
    };
  }, [integration, location.search]);

  // Focus management after view transitions
  useEffect(() => {
    if (currentView === 'download') {
      downloadHeaderRef.current?.focus();
    }
  }, [currentView]);

  // A scanned QR lands here with the channel in the hash, which startup lifts
  // out of the URL before render — see lib/pairing-channel-params. The capture
  // is fixed by then, so this is settled before the bootstrap effect below runs.
  const pairingChannelInfo = useMemo(
    () => parsePairingHash(getPairingChannelHashParams()?.toString()),
    []
  );

  const device = deviceProp ?? detectDevice();
  const isFirefoxDesktop = device === Devices.FIREFOX_DESKTOP;
  const isFirefoxMobile =
    device === Devices.FIREFOX_IOS || device === Devices.FIREFOX_ANDROID;

  // A phone that scanned the QR with its system camera opens this page in
  // whatever browser it defaults to, which is might not be Firefox.
  // When the browser never answered fxa_status there is no WebChannel here to
  // carry the flow, so we will hand the pairing URL to the Firefox app instead,
  // falling back to the app store when it is not installed.
  //
  // Until the deployment has rolled pairing v2 out to Firefox iOS, the app
  // cannot act on the pair URL, so an iOS plan opens the connect hint page
  // instead — it tells a user who has Firefox to scan again from inside it.
  //
  // Read-only, so it is safe to evaluate during render; the auto-attempt token
  // is only spent by the download screen this routes to.
  const handoffPlan: HandoffPlan = useMemo(() => {
    if (pairingChannelInfo && fxaStatusResult.fxaStatusState === 'unanswered') {
      return planPairingHandoff({
        device,
        targetUrl: buildPairUrl(pairingChannelInfo),
        hintUrl: buildConnectHintUrl(),
        storeLinks: config.mobileStoreLinks,
        storage: getAttemptStorage(),
        build: config.pairing.browserBuild,
        iosScheme: config.pairing.iosUrlScheme,
        iosHandoff: isPairingV2RolledOut(config.pairing, 'ios'),
        isSafari: isIosSafari(),
      });
    }

    // This indicates no handoff is needed. and we can continue as normal.
    return { kind: 'none' };
  }, [pairingChannelInfo, fxaStatusResult.fxaStatusState, device, config]);

  // The bootstrap ends in a hard navigation that nothing can undo, so it starts
  // at most once per mount. `abortBootstrapRef` stands an in-flight run down on
  // unmount, and when a later pass of the effect below routes somewhere else.
  const bootstrapStartedRef = useRef(false);
  const abortBootstrapRef = useRef(false);
  // Read when the bootstrap settles; a late fxa_status answer can change it.
  const pairingV2Ref = useRef(false);
  useEffect(() => {
    return () => {
      abortBootstrapRef.current = true;
    };
  }, []);

  useEffect(() => {
    // Lowered again below, after the last branch that routes elsewhere, so
    // such a branch leaves an in-flight bootstrap standing down.
    abortBootstrapRef.current = true;

    // This is a signal that the initial fxa_status message is still pending.
    // Don't move forwards with other evaluations until we have a definitive
    // answer here. 'unanswered' is a definitive answer: no reply is coming.
    if (fxaStatusResult.fxaStatusState === 'pending') {
      return;
    }

    // This device has a Firefox app to hand the pairing URL to, so the
    // download screen owns the rest of the flow. Must be checked before the
    // !isFirefoxDesktop branch, which would otherwise send every mobile
    // browser to /pair/unsupported.
    if (handoffPlan.kind !== 'none') {
      navigateWithQuery(
        '/pair/supplicant/download_firefox',
        { state: pairingChannelInfo },
        // The channel key is the pairing PSK. It travels in router state, so
        // the hash it arrived in must not follow it into the next URL.
        false
      );
      return;
    }

    // Switch on pairing version 2! Same gate as ConnectAnotherDevice; see
    // isPairingV2Enabled for what decides it.
    const pairingV2 = isPairingV2Enabled({
      pairing: config.pairing,
      device,
      userAgent: navigator.userAgent,
      browserPairingVersion:
        fxaStatusResult.fxaStatus?.capabilities.pairingVersion,
    });

    if (pairingV2 && pairingChannelInfo?.version === '2') {
      navigateWithQuery(
        '/pair/supplicant/connect_this_device',
        { state: pairingChannelInfo },
        false
      );
      return;
    }

    // This is a signal that the initial fxa_status message is still pending.
    // Don't move forwards with other evaluations until we have a definitive
    // answer here.
    if (!fxaStatusResult.fxaStatus) {
      return;
    }

    // Switch on pairing version 2! Same gate as ConnectAnotherDevice; see
    // isPairingV2Enabled for what decides it.
    if (
      pairingV2 &&
      pairingChannelInfo &&
      parseInt(pairingChannelInfo?.version) === 2
    ) {
      navigateWithQuery(
        '/pair/supplicant/connect_this_device',
        { state: pairingChannelInfo },
        // The channel key is the pairing PSK. It travels in router state, so
        // the hash it arrived in must not follow it into the next URL.
        false
      );
      return;
    }

    pairingV2Ref.current = pairingV2;
    // The authority channel needs no account, but approving a sign-in does, so
    // a signed-out desktop takes the sign-in bootstrap below first.
    if (
      isFirefoxDesktop &&
      pairingV2 &&
      isVerifiedUser(fxaStatusResult.fxaStatus.signedInUser)
    ) {
      goToScanQr();
      return;
    }

    // Firefox on a phone that opened a scanned v2 URL but did not take the v2
    // flow above — too old, or its platform not rolled out. It can still pair
    // by scanning the code from inside the app, which is what the hint says.
    if (isFirefoxMobile && pairingChannelInfo) {
      navigateWithQuery('/pair/supplicant/connect_hint', undefined, false);
      return;
    }

    if (!isFirefoxDesktop) {
      navigateWithQuery('/pair/unsupported');
      return;
    }

    abortBootstrapRef.current = false;
    if (bootstrapStartedRef.current) {
      return;
    }
    bootstrapStartedRef.current = true;

    (async () => {
      const askFirefox = () =>
        firefox
          .requestSignedInUser(
            Constants.OAUTH_CONTEXT,
            true,
            Constants.SYNC_SERVICE
          )
          .catch(() => undefined);

      // Retry on empty replies so a slow fxaLogin handoff doesn't bail to /signin.
      const MAX_RETRIES = 1;
      let signedInUser = await askFirefox();
      for (
        let attempt = 0;
        !abortBootstrapRef.current &&
        attempt < MAX_RETRIES &&
        !isVerifiedUser(signedInUser);
        attempt++
      ) {
        signedInUser = await askFirefox();
      }
      if (abortBootstrapRef.current) return;

      if (isVerifiedUser(signedInUser)) {
        if (pairingV2Ref.current) {
          goToScanQr();
        } else {
          setBootstrapping(false);
        }
        return;
      }
      const oauthParams = await firefox
        .fxaOAuthFlowBegin(['profile', Constants.OAUTH_OLDSYNC_SCOPE])
        .catch(() => null);
      if (abortBootstrapRef.current) return;
      if (oauthParams) {
        // buildSyncOAuthSearch emits OAuth params only, so the attribution
        // params would be lost across the sign-in round trip and /pair would
        // come back without an entrypoint (FXA-14132).
        const search = buildSyncOAuthSearch(oauthParams);
        for (const [key, value] of Object.entries(pairingAttribution)) {
          search.set(key, value);
        }
        hardNavigate(`/?${search}`);
        return;
      }
      // WebChannel didn't reply; reveal the page so the user isn't stuck.
      setBootstrapping(false);
    })();
    // `pairingAttribution` is captured at mount on purpose; re-running on a new
    // attribution value would re-ask the WebChannel.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pairingChannelInfo,
    fxaStatusResult.fxaStatusState,
    fxaStatusResult.fxaStatus?.capabilities.pairingVersion,
    handoffPlan,
    navigateWithQuery,
  ]);

  // Banner variant is driven by router state from getSyncNavigate.
  const { origin: pairOrigin } = (location.state ?? {}) as Pick<
    SigninLocationState,
    'origin'
  >;

  // Router state is the primary channel, but flows that stop at an interstitial
  // (/signup_confirmed_sync, /inline_recovery_key_setup) reach here through a
  // hard navigation that carries the query param instead, and a reload drops
  // router state entirely. Both are validated: `location.state` is untyped at
  // runtime, and the param is user-controllable.
  const pairReason = useMemo(() => {
    const fromState = (location.state as { pairReason?: unknown } | null)
      ?.pairReason;
    if (isPairGleanReason(fromState)) {
      return fromState;
    }
    const fromQuery = new URLSearchParams(location.search).get('pairReason');
    return isPairGleanReason(fromQuery) ? fromQuery : undefined;
  }, [location.state, location.search]);

  // Fire Glean view events only after the bootstrap reveals the page;
  // otherwise users redirected during bootstrap would skew the metric.
  const recordedView = useRef<string | null>(null);
  useEffect(() => {
    if (bootstrapping) return;
    const viewKey = currentView === 'choice' ? `choice:${pairReason}` : 'view';
    if (recordedView.current === viewKey) return;
    recordedView.current = viewKey;
    if (currentView === 'choice') {
      // Recorded as an empty reason when /pair is reached outside a sign-in or
      // sign-up flow, or from a flow with no sanctioned bucket (third-party
      // auth) — the dispatcher coerces a missing reason to ''.
      GleanMetrics.cadFireFox.choiceView({ event: { reason: pairReason } });
      return;
    }
    GleanMetrics.cadFireFox.view();
  }, [bootstrapping, currentView, pairReason]);

  const bannerCopy =
    currentView === 'choice' && pairOrigin ? PAIR_BANNER_FTL[pairOrigin] : null;

  const isSendTab = isSendTabEntrypoint(integration?.data.entrypoint);

  // Tells Firefox to open about:preferences#sync and start pairing.
  const openPairPreferences = useCallback(() => {
    // Firefox takes over from here and later opens a brand-new
    // /oauth?…redirect_uri=…pair-auth-webchannel navigation that carries none of
    // this page's attribution params (FXA-14132). Stash them so the approval page
    // can restore them.
    stashPairingAttribution(pairingAttribution);
    firefox.send(FirefoxCommand.PairPreferences, {});
  }, [pairingAttribution]);

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

  if (bootstrapping || fxaStatusResult.fxaStatusState === 'pending') {
    return <LoadingSpinner fullScreen />;
  }

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
              <QRCode
                value={buildPairingDownloadUrl(integration?.data.entrypoint)}
                localizedLabel={localizedQRCodeLabel}
                logoSrc={firefoxLogo}
                size={224}
                loadingDelayMs={200}
                className="my-10 mx-auto"
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
