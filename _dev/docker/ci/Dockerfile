# These builds occur in the CI. Reference .circleci/config.yml

# Setup Default CI build
FROM cimg/node:16.13 as ci

ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV YARN_CHECKSUM_BEHAVIOR=throw
ENV FXA_AUTO_INSTALL=0

COPY --chown=circleci:circleci .yarn /home/circleci/.yarn
COPY --chown=circleci:circleci project /home/circleci/project

# Install packages so container is ready to build.
# Remove l10n files, becuase those need to fetched again anyways
# to ensure the latest state is being used.
RUN yarn install --immutable --inline-builds; \
    git rev-parse HEAD > base_ref; \
    cp yarn.lock yarn.lock.base; \
    rm -rf ./packages/fxa-settings/fxa-content-server-l10n; \
    rm -rf ./packages/fxa-content-server/fxa-content-server-l10n; \
    rm -rf ./packages/fxa-auth-server/fxa-content-server-l10n; \
    rm -rf ./packages/fxa-react/fxa-content-server-l10n;

# Setup browser based docker images for functional tests
FROM cimg/node:16.13-browsers as browsers

ENV FXA_AUTO_INSTALL=0

# Copies over browsers, installed by external CI commands, for functional tests
# TODO: Remove when we phase out content server tests
COPY --chown=circleci:circleci install /usr/local/bin/

# Copy over base image state
COPY --chown=circleci:circleci --from=ci_base /home/circleci /home/circleci

# Install firefox for playwright tests
RUN npx playwright install firefox

# Produces single layer images. Which appear are more efficient.
FROM cimg/node:16.13-browsers as ci-final
COPY --chown=circleci:circleci --from=browsers_base /home/circleci /home/circleci

FROM cimg/node:16.13-browsers as browsers-final
COPY --chown=circleci:circleci --from=browsers_base /home/circleci /home/circleci
