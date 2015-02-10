FROM ubuntu:trusty

RUN DEBIAN_FRONTEND=noninteractive apt-get -y update && DEBIAN_FRONTEND=noninteractive apt-get -y install nodejs npm
RUN ln -sf /usr/bin/nodejs /usr/local/bin/node

RUN useradd --home-dir /opt/fxa fxa
USER fxa

WORKDIR /opt/fxa

CMD npm start
