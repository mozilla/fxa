FROM circleci/node:12-stretch-browsers

USER root
RUN apt-get update && apt-get install -y \
    bison \
    build-essential \
    cmake \
    flex \
    graphicsmagick \
    libboost-dev \
    libboost-filesystem-dev \
    libboost-regex-dev \
    libboost-system-dev \
    python-setuptools \
    python-dev \
    && rm -rf /var/lib/apt/lists/*
RUN npm install -g npm
RUN easy_install pip
RUN pip install mozdownload mozinstall
RUN mozdownload --version 68.0 --destination firefox.tar.bz2
RUN wget https://s3-us-west-2.amazonaws.com/fxa-dev-bucket/fenix-pair/desktop/7f10c7614e9fa46-target.tar.bz2

USER circleci

RUN curl https://sh.rustup.rs -sSf | sh -s -- -y
ENV PATH=/home/circleci/.cargo/bin:$PATH
RUN cargo install cargo-audit

# copy this Dockerfile into the image so we can compare it later
COPY --chown=circleci:circleci Dockerfile /

CMD ["/bin/sh"]
