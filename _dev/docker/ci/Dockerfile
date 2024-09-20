# These builds occur in the CI. Reference .circleci/config.yml. They assume
# everything is using the circleci ramdisk. Their primary purpose is to
# help decrease spin up needed to start a CI job.

# Runs tests and common CI operations. Needs minimal install. Assumes
# workspace will be restored into the project folder.
FROM cimg/node:20.11 as test-runner
RUN sudo apt-get update && sudo apt-get install -y \
    python3-venv
WORKDIR /home/circleci
COPY --chown=circleci:circleci project project
WORKDIR /home/circleci/project
RUN git rev-parse HEAD > base_ref;
RUN cp yarn.lock yarn.lock.base;


# Runs initial build stage in CI. Needs full install. Responsible for
# setting up the initial workspace state. This image installs npm
# packages and builds heavily referenced workspaces.
FROM test-runner as builder
WORKDIR /home/circleci
COPY --chown=circleci:circleci .yarn .yarn
WORKDIR /home/circleci/project
ENV YARN_CHECKSUM_BEHAVIOR=throw
ENV FXA_AUTO_INSTALL=0
RUN _scripts/l10n/clone.sh
RUN yarn install --immutable;


# Use the official Playwright image to install Playwright and browsers
FROM mcr.microsoft.com/playwright:v1.46.1-noble as playwright-install

RUN apt-get update && apt-get install -y \
    libicu-dev \
    libxslt1.1 \
    libwoff1 \
    libvpx-dev \
    libevent-dev \
    libopus-dev \
    gstreamer1.0-libav \
    gstreamer1.0-plugins-base \
    gstreamer1.0-plugins-good \
    gstreamer1.0-plugins-bad \
    gstreamer1.0-plugins-ugly \
    gstreamer1.0-alsa \
    gstreamer1.0-pulseaudio \
    gstreamer1.0-plugins-rtp \
    gstreamer1.0-tools \
    gstreamer1.0-x \
    libwebpdemux2 \
    libenchant-2-2 \
    libsecret-1-0 \
    libhyphen0 \
    libmanette-0.2-0 \
    libflite1 \
    libx264-dev

WORKDIR /home/pwuser
# Playwright comes preinstalled in this image, so we don't need additional steps here.

# Runs functional tests in our CI, using the cimg/node image and the Playwright installation
FROM cimg/node:20.11-browsers as functional-test-runner
WORKDIR /home/circleci

# Copy the Playwright browsers and setup from the official image
COPY --from=playwright-install /ms-playwright /ms-playwright

# Copy project files
COPY --chown=circleci:circleci project project
WORKDIR /home/circleci/project

# Ensure correct library path at runtime
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
ENV LD_LIBRARY_PATH=/lib/x86_64-linux-gnu:$LD_LIBRARY_PATH

# Copy the install script and any necessary binaries
COPY --chown=circleci:circleci install /usr/local/bin/
