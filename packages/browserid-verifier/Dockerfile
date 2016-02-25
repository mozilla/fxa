FROM node:0.10.42

# install libgmp-dev for fast crypto and 
RUN apt update && \
    apt install -y libgmp-dev

# add a non-privileged user for installing and running
# the application
RUN groupadd --gid 10001 app && \
    useradd --uid 10001 --gid 10001 --home /app --create-home app

WORKDIR /app

# Install node requirements and clean up unneeded cache data
COPY package.json package.json
RUN su app -c "npm install" && \
    npm cache clear && \
    rm -rf ~app/.node-gyp && \
    apt remove -y libgmp-dev && \
    apt-get autoremove -y && \
    apt-get clean

# Finally copy in the app's source file
# More cache friendly?
COPY . /app

USER app
ENTRYPOINT ["npm"]
CMD ["start"]
