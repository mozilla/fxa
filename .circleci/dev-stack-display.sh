#!/bin/bash
#
# Virtual display for the interactive dev-stack job.
#
# Usage: ./.circleci/dev-stack-display.sh install|start
#
#   install  apt-gets the X11/VNC tooling the base image lacks.
#   start    runs Xvfb + a window manager + VNC in the foreground (use as a
#            CircleCI `background: true` step).
#
# The base image is cimg/node:<v>-browsers, which ships Xvfb but neither xauth
# (needed by `ssh -X`) nor a VNC server. Installing here rather than in
# _dev/docker/ci/Dockerfile keeps the shared `-vN` image tag untouched; see
# .circleci/README.md for what a Dockerfile change costs.

set -euo pipefail

DISPLAY_NUM="${DEV_STACK_DISPLAY:-:99}"
SCREEN="${DEV_STACK_SCREEN:-1600x1000x24}"
VNC_PORT="${DEV_STACK_VNC_PORT:-5901}"
NOVNC_PORT="${DEV_STACK_NOVNC_PORT:-6080}"

install_tooling() {
  sudo apt-get update
  sudo apt-get install -y --no-install-recommends \
    xauth \
    xvfb \
    x11-utils \
    x11-apps \
    x11vnc \
    fluxbox \
    novnc \
    websockify

  # An interactive SSH shell sources $BASH_ENV, so anything launched from that
  # shell (firefox, a headed playwright run) lands on the virtual display
  # without the caller having to know the display number.
  echo "export DISPLAY=${DISPLAY_NUM}" >> "${BASH_ENV:-$HOME/.bashrc}"
}

start_display() {
  export DISPLAY="${DISPLAY_NUM}"

  Xvfb "${DISPLAY_NUM}" -screen 0 "${SCREEN}" -nolisten tcp &
  local xvfb_pid=$!

  for _ in $(seq 30); do
    xdpyinfo -display "${DISPLAY_NUM}" >/dev/null 2>&1 && break
    sleep 1
  done
  if ! xdpyinfo -display "${DISPLAY_NUM}" >/dev/null 2>&1; then
    echo "Xvfb never came up on ${DISPLAY_NUM}" >&2
    exit 1
  fi

  # Everything past this point is a convenience layer on top of a working
  # display. A failure here must not take Xvfb down with it, or `ssh -X` and
  # headed test runs break too.
  fluxbox >/dev/null 2>&1 &

  # -localhost binds the VNC socket to loopback, so the only route in is an SSH
  # tunnel through CircleCI's gateway.
  x11vnc \
    -display "${DISPLAY_NUM}" \
    -rfbport "${VNC_PORT}" \
    -localhost \
    -nopw \
    -forever \
    -shared \
    -quiet &

  # noVNC, for when you would rather not install a VNC client.
  local novnc_web=/usr/share/novnc
  if [[ -d "${novnc_web}" ]]; then
    websockify \
      --web "${novnc_web}" \
      "127.0.0.1:${NOVNC_PORT}" \
      "127.0.0.1:${VNC_PORT}" &
  else
    echo "noVNC assets not at ${novnc_web}; use vnc://127.0.0.1:${VNC_PORT} instead" >&2
  fi

  echo "Display ${DISPLAY_NUM} ready. VNC on ${VNC_PORT}, noVNC on ${NOVNC_PORT}."

  # Hold the step open for as long as the display lives.
  wait "${xvfb_pid}"
}

case "${1:-}" in
  install) install_tooling ;;
  start)   start_display ;;
  *)       echo "usage: $0 install|start" >&2; exit 2 ;;
esac
