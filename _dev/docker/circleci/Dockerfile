FROM circleci/node:16-stretch-browsers

USER root
RUN apt-get update && apt-get install -y \
    python-setuptools \
    python-dev \
    python-pip \
    && rm -rf /var/lib/apt/lists/*

RUN pip install mozdownload mozinstall
RUN mozdownload --version latest-esr --destination firefox.tar.bz2

USER circleci

# copy this Dockerfile into the image so we can compare it later
COPY --chown=circleci:circleci Dockerfile /

CMD ["/bin/sh"]
