/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 * Inferring "the Firefox deep link did not resolve" on iOS, so the caller can
 * send the user to the App Store. Ported from the FXA-13863 proof of concept.
 * The findings below constrain the whole shape of this file:
 *
 * 1. The app hand-off MUST be a top-level, user-initiated navigation. WebKit
 *    ignores external-scheme navigations made from a subframe, so a hidden
 *    iframe never launches anything on iOS — and a store-fallback timer then
 *    fires and sends users who *have* Firefox to the App Store. The deep link
 *    therefore belongs in a CTA's `href`, so the tap itself is the navigation;
 *    this module only watches what happens afterwards.
 *
 * 2. The "address is invalid" alert cannot be suppressed with a custom scheme.
 *    When Firefox isn't installed, `firefox://` raises it, and no API reports
 *    it. Universal Links are the only alert-free mechanism, and they don't work
 *    yet: we serve accounts.firefox.com's apple-app-site-association claiming
 *    `/pair` and `/pair/*` (see
 *    fxa-content-server/server/lib/routes/get-apple-app-site-association.js),
 *    but Universal Links are a two-sided handshake and Firefox iOS ships
 *    `com.apple.developer.associated-domains` as an EMPTY array. Until the app
 *    adds `applinks:accounts.firefox.com` (FXA-13732), our AASA entries are inert.
 *
 * 3. The store fallback is therefore inferred, not detected: we treat "the page
 *    never went hidden" as "the app never opened". The trap is that iOS hands
 *    focus back to the page when the "Open in Firefox?" dialog is confirmed, a
 *    beat BEFORE it backgrounds Safari — so regained focus can only *start* a
 *    grace window, never trigger the fallback.
 *
 *    Known limitation: a *cancelled* "Open in Firefox?" confirmation is
 *    genuinely indistinguishable from the error alert — both are blur → focus
 *    with nothing following — so cancelling sends a user who *has* Firefox to
 *    the App Store. That is why the caller should navigate with assign() and
 *    not replace(): Back returns to the interstitial so they can retry.
 */

/** Backstop for a *silent* failure — no dialog, no launch. */
export const STORE_FALLBACK_TIMEOUT_MS = 2000;
/**
 * How long the app switch gets to win after focus comes back. Tapping "Open" on
 * iOS's "Open in Firefox?" dialog hands focus back to the page BEFORE Safari is
 * backgrounded, so focus alone must never trigger the fallback.
 */
export const STORE_FALLBACK_GRACE_MS = 1000;

type TimerWindow = Pick<
  Window,
  'addEventListener' | 'removeEventListener' | 'setTimeout' | 'clearTimeout'
>;

/**
 * Watch for the deep link failing and call `onFallback` when it does.
 *
 * There is no API that reports "the custom scheme didn't resolve", so we infer
 * it. The subtlety that makes this hard: iOS dismisses BOTH native dialogs the
 * same way as far as the page can see.
 *
 *   not installed:  tap -> blur ("address is invalid") -> focus (tapped OK)
 *                   -> nothing else ever happens.
 *   installed:      tap -> blur ("Open in Firefox?") -> focus (tapped Open!)
 *                   -> *then* Safari is backgrounded -> blur + hidden.
 *
 * So regained focus is NOT the decision point — it arrives on the happy path
 * too, before iOS has backgrounded us. Redirecting there sent people who tapped
 * "Open" to the App Store. Instead focus only opens a `grace` window, and any of
 * hidden/pagehide/a second blur cancels it. Nothing left to cancel it by the
 * time the window closes means the launch really did fail.
 *
 * `win`/`doc` are injectable so the decision is testable; the event ordering
 * itself is device behaviour a jsdom test cannot honestly assert.
 *
 * @returns a teardown that removes every listener and clears every timer.
 */
export function armStoreFallback({
  onFallback,
  timeoutMs = STORE_FALLBACK_TIMEOUT_MS,
  graceMs = STORE_FALLBACK_GRACE_MS,
  win = window,
  doc = document,
}: {
  onFallback: () => void;
  timeoutMs?: number;
  graceMs?: number;
  win?: TimerWindow;
  doc?: Document;
}): () => void {
  let appOpened = false;
  let sawBlur = false;
  let sawFocus = false;
  let graceTimer = 0;
  let torndown = false;

  const fallback = () => {
    if (appOpened || doc.visibilityState !== 'visible') {
      return;
    }
    teardown();
    onFallback();
  };

  // Definitive "the app opened" signals — a real background or teardown.
  const onHidden = () => {
    if (doc.hidden) {
      appOpened = true;
      win.clearTimeout(graceTimer);
    }
  };
  const onLeave = () => {
    appOpened = true;
    win.clearTimeout(graceTimer);
  };

  const onBlur = () => {
    win.clearTimeout(graceTimer);
    // A blur *after* we had already regained focus is the app taking the
    // foreground on its second act — the dialog was confirmed and the launch is
    // under way. Treat it as opened, so this still holds together on any iOS
    // version where visibilitychange does not fire for an app switch.
    if (sawFocus) {
      appOpened = true;
    }
    sawBlur = true;
  };

  const onFocus = () => {
    if (appOpened) {
      return;
    }
    sawFocus = true;
    win.clearTimeout(graceTimer);
    graceTimer = win.setTimeout(fallback, graceMs);
  };

  doc.addEventListener('visibilitychange', onHidden);
  win.addEventListener('pagehide', onLeave);
  win.addEventListener('blur', onBlur);
  win.addEventListener('focus', onFocus);

  // Backstop for a silent failure: the scheme no-ops with no dialog at all, so
  // there is no blur/focus pair to key off. Deliberately gated on `!sawBlur` —
  // if a dialog did appear, the blur/focus machinery owns the decision, and
  // firing here could redirect while that dialog is still on screen, which is
  // what a bare timer does to anyone slow to tap "Open".
  const timer = win.setTimeout(() => {
    if (!sawBlur) {
      fallback();
    }
  }, timeoutMs);

  function teardown() {
    if (torndown) {
      return;
    }
    torndown = true;
    doc.removeEventListener('visibilitychange', onHidden);
    win.removeEventListener('pagehide', onLeave);
    win.removeEventListener('blur', onBlur);
    win.removeEventListener('focus', onFocus);
    win.clearTimeout(timer);
    win.clearTimeout(graceTimer);
  }

  return teardown;
}
