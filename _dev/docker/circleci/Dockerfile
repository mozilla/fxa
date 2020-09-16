FROM circleci/node:12-stretch-browsers

USER root
RUN apt-get update && apt-get install -y \
    python-setuptools \
    python-dev \
    && rm -rf /var/lib/apt/lists/*

RUN easy_install pip
RUN pip install mozdownload mozinstall
RUN mozdownload --version 68.0 --destination firefox.tar.bz2
RUN wget https://s3-us-west-2.amazonaws.com/fxa-dev-bucket/fenix-pair/desktop/7f10c7614e9fa46-target.tar.bz2

USER circleci

# copy this Dockerfile into the image so we can compare it later
COPY --chown=circleci:circleci Dockerfile /

CMD ["/bin/sh"]
