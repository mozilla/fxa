#!/bin/bash
#
# Prints connection instructions for the interactive dev-stack job.
#
# The SSH host and port are assigned by CircleCI's gateway when a job is rerun
# with SSH and are not exposed to the job itself, so they appear as placeholders
# here. Copy them from the job's SSH panel in the CircleCI UI.

set -euo pipefail

cat <<'BANNER'

================================================================================
  FxA dev stack is up.
================================================================================

  1. TUNNEL

  Take the host and port from this job's SSH panel in the CircleCI UI
  ("Rerun job with SSH" -> the `ssh -p <PORT> <HOST>` line), then:

    ssh -p <PORT> <HOST> \
      -L 3030:127.0.0.1:3030 \
      -L 3000:127.0.0.1:3000 \
      -L 9000:127.0.0.1:9000 \
      -L 9001:127.0.0.1:9001 \
      -L 1111:127.0.0.1:1111 \
      -L 1112:127.0.0.1:1112 \
      -L 8080:127.0.0.1:8080 \
      -L 8091:127.0.0.1:8091 \
      -L 8095:127.0.0.1:8095 \
      -L 6080:127.0.0.1:6080 \
      -L 5901:127.0.0.1:5901 \
      -L 9130:127.0.0.1:9130 \
      -L 9160:127.0.0.1:9160

    3030  content server            3000  fxa-settings (webpack dev server)
    9000  auth server               9001  mail helper (verification emails)
    1111  profile server            1112  profile static (avatars)
    8080  123done relier            8091  admin panel
    8095  admin server              6080  noVNC        5901  VNC
    9130  content-server inspector  9160  auth-server inspector

  The port numbers are preserved on purpose: the services advertise
  `localhost:<port>` URLs in their served config, so a same-port tunnel makes
  them work unmodified.

  2. SEE THE UI

  a) Your own browser (fastest, real devtools) - with the tunnel open, load
       http://localhost:3030

  b) VNC, to watch a headed Playwright run
       open vnc://localhost:5901          # macOS Screen Sharing
       http://localhost:6080/vnc.html     # or in a browser
     then, on this box:
       DISPLAY=:99 DEBUG=1 yarn playwright test --project=local <spec>
     DEBUG is what flips Playwright to headed (see playwright.config.ts).

  c) X11 forwarding
       ssh -X -p <PORT> <HOST>
       firefox
     Works, but X11 is chatty over a WAN link and will feel slow.

  3. SIGNING UP

  Mail is captured locally, not delivered. Use any @restmail.net address and
  read the message at:
       http://localhost:9001/mail/<local-part>

  4. GOTCHAS

  - This runs NODE_ENV=test with the functional-test executor's env, so customs
    is disabled and the React / recovery-phone / passwordless flags are forced
    on. It matches the functional tests, not your local `yarn start`.
  - Service state:  npx pm2 ls   ·   logs:  npx pm2 logs
  - fxa-settings on :3000 is a live dev server, so edits under
    packages/fxa-settings hot-rebuild. Other services need a restart.

  5. WHEN YOU ARE DONE

       touch /tmp/release-stack

  This ends the job within a minute and stops burning credits. Otherwise the
  stack holds until the timeout printed by the hold step.

================================================================================

BANNER
