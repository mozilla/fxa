# Designed to create a development build specifically for fxa's stack
# Example usage:
# > docker build . --tag sync-for-fxa
# > docker run --rm -p 8000:8000 -v  sync-for-fxa
#
# Note that adjust settings simply edit
FROM rust:1.80
WORKDIR /app

# Add extra libs and setup python
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    cmake golang-go python3-dev python3-pip python3-setuptools python3-wheel python3.11-venv libmariadb-dev-compat libmariadb-dev

# Checkout the source, and switch to tag 0.17.2 which is what this was last tested with.
RUN git clone https://github.com/mozilla-services/syncstorage-rs.git . && \
    git checkout 0.17.2

# Install python dependencie
RUN rm -rf venv && \
    python3 -m venv venv && \
    venv/bin/python -m pip install -r requirements.txt

# Install rust dependencies
RUN cargo install --path ./syncserver --no-default-features --features=syncstorage-db/mysql --features=py_verifier --locked

# Prebuild for faster startup
RUN cargo build --no-default-features --features=syncstorage-db/mysql --features=py_verifier

COPY config/local.toml config/local.toml

CMD ["make", "run_mysql"]
