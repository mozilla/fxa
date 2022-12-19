FROM cimg/node:16.13

ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV YARN_CHECKSUM_BEHAVIOR=throw
ENV FXA_AUTO_INSTALL=0

COPY --chown=circleci:circleci . .

RUN git rev-parse HEAD > base_ref; \
    cp yarn.lock yarn.lock.base; \
    yarn install --immutable; \
    yarn workspace fxa-shared build; \
    yarn workspace fxa-auth-client build;
