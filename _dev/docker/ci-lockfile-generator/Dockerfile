# This is probably not useful for the majority of users; however, it maybe helpful in the
# event you are on a system plagued by checksum mismatches as described here:
#  - https://github.com/yarnpkg/berry/issues/2399
#
# By running a yarn install inside the same base container that we use in our CI, we can
# ensure the same checksums are created correctly.
#
FROM cimg/node:22.15

COPY . .
RUN sudo yarn cache clear --all
RUN sudo YARN_CHECKSUM_BEHAVIOR=update yarn install --mode=skip-build
CMD set +x && sudo cat yarn.lock
