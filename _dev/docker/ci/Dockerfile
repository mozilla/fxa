FROM cimg/node:16.3

# Copy over app code
COPY --chown=circleci:circleci . /fxa
WORKDIR /fxa

# Do a yarn install and make backup of yarn lock file.
# RUN yarn install && cp yarn.lock yarn.lock.base

# Remove unneeded files
RUN find . -regextype egrep ! -regex '.*(\.|\.\.|packages|node_modules).*' -type d -exec rm -rf {} +;
RUN for d in ./packages/*/ ; do find $d -regextype egrep ! -regex '.*(dist|node_modules|fxa-content-server-l10n).*' -type d -exec rm -rf {} +; done;
