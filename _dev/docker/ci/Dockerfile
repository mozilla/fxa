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
# setting up the initially workspace state. This image installs npm
# packages and builds heavily referenced workspaces.
FROM test-runner as builder
WORKDIR /home/circleci
COPY --chown=circleci:circleci .yarn .yarn
WORKDIR /home/circleci/project
ENV YARN_CHECKSUM_BEHAVIOR=throw
ENV FXA_AUTO_INSTALL=0
RUN _scripts/l10n/clone.sh
RUN yarn install --immutable;

# Acts as an intermediate stage for adding the firefox install. Note,
# that a yarn install must happen first to ensure the correct version
# of firefox is installed. Also note that the functional-test-runner
# must based on cimg/node:20.11-browsers, which is why this stage
# is necessary.
FROM builder as playwright-install
RUN npx playwright install --with-deps firefox chromium webkit;
RUN apt-get update && apt-get install -y libxslt1.1 libxslt-dev


# Runs functional tests in our CI. Needs minimal install. Assumes
# workspace will be restored into the project folder.
FROM cimg/node:20.11-browsers as functional-test-runner
WORKDIR /home/circleci
COPY --chown=circleci:circleci --from=playwright-install /home/circleci/.cache/ms-playwright .cache/ms-playwright/
COPY --chown=circleci:circleci project project
WORKDIR /home/circleci/project
COPY --chown=circleci:circleci install /usr/local/bin/
