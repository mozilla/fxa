# Designed to create a development build specifically for fxa's stack
# Example usage:
# > docker build . --tag sync-for-fxa
# > docker run --rm -p 8000:8000 sync-for-fxa
#
# To adjust settings, edit config/local.toml.
FROM ghcr.io/mozilla-services/syncstorage-rs/syncserver-mysql:0.24.1

COPY config/local.toml /app/config/local.toml

CMD ["--config=config/local.toml"]
