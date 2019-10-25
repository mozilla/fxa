FROM circleci/node:10-stretch-browsers

USER root
RUN apt-get update && apt-get install -y graphicsmagick python-setuptools python-dev build-essential
RUN easy_install pip
RUN pip install mozdownload mozinstall
RUN mozdownload --version 68.0 --destination firefox.tar.bz2
RUN wget https://s3-us-west-2.amazonaws.com/fxa-dev-bucket/fenix-pair/desktop/7f10c7614e9fa46-target.tar.bz2

USER circleci

RUN curl https://sh.rustup.rs -sSf | sh -s -- -y
ENV PATH=/home/circleci/.cargo/bin:$PATH
RUN cargo install cargo-audit

CMD ["/bin/sh"]
