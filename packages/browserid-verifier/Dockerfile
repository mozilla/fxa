FROM node:4.8.2-slim

# add a non-privileged user for installing and running
# the application
RUN groupadd --gid 10001 app && \
    useradd --uid 10001 --gid 10001 --home /app --create-home app

WORKDIR /app

# Install node requirements and clean up temporary files
COPY package.json package.json
RUN apt-get update && \
    apt-get install -y libgmp-dev git python build-essential && \
    su app -c "npm --loglevel warn install" && \
    npm cache clear && \
    apt remove -y libgmp-dev git python build-essential && \
    apt-get autoremove -y && \
    apt-get clean && \
    rm -rf ~app/.node-gyp && \
    rm -rf ~app/.npm && \
    rm -r /tmp/* && \
    rm -r /var/lib/apt/lists/*

COPY . /app

USER app
ENTRYPOINT ["npm"]
CMD ["start"]
