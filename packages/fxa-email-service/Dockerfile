# Docker 17.05 or higher required for multi-stage builds
FROM rust:1.26.0-stretch as builder
COPY . /app
WORKDIR /app
RUN \
    apt-get -qq update && \
    apt-get -qq install -y default-libmysqlclient-dev && \
    \
    cargo --version && \
    rustc --version && \
    mkdir -m 755 bin && \
    mkdir -m 755 bin/config && \
    cargo build --release && \
    cp -R /app/config/* /app/bin/config && \
    cp /app/target/release/fxa_email_send /app/bin && \
    cp /app/target/release/fxa_email_queues /app/bin

FROM debian:stretch-slim
# FROM debian:stretch  # for debugging docker build
RUN \
    groupadd --gid 10001 app && \
    useradd --uid 10001 --gid 10001 --home /app --create-home app && \
    \
    apt-get -qq update && \
    apt-get -qq install -y default-libmysqlclient-dev libssl-dev ca-certificates && \
    update-ca-certificates && \
    rm -rf /var/lib/apt/lists

COPY --chown=app:app --from=builder /app/version.json /app/version.json
COPY --chown=app:app --from=builder /app/.sourcehash /app/.sourcehash
COPY --chown=app:app --from=builder /app/bin /app/bin

WORKDIR /app/bin
USER app

ENV FXA_EMAIL_ENV production
ENV ROCKET_ENV production

CMD ["/app/bin/fxa_email_send"]
