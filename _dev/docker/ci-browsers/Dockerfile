FROM mozilla/fxa-circleci:ci-base-latest
# Empty pull. This has the latest and greatest from fxa.

FROM cimg/node:16.13-browsers

ENV FXA_AUTO_INSTALL=0

# Install playwright browsers
# One of the biggest culprits of slow install times is playwright since it downloads browser binaries
RUN cd /home/circleci; \
    npx playwright install; \
    rm -rf /home/circleci/.cache/ms-playwright/webkit*; \
    rm -rf /home/circleci/.cache/ms-playwright/chromium*;

# Copy over the installed browsers
COPY --chown=circleci:circleci ./install /usr/local/bin/.

# Copy over the source from the ci-base-latest tag.
COPY --chown=circleci:circleci --from=0 /home/circleci/project .
