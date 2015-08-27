FROM node:0.10

WORKDIR /app

# install libgmp-dev for fast crypto and 
RUN apt update && \
    apt install -y libgmp-dev

# Install node requirements and clean up unneeded cache data
COPY . /app

RUN npm install && \
    npm cache clear && \
    rm -rf /root/.node-gyp && \
    apt remove -y libgmp-dev && \
    apt-get autoremove -y && \
    apt-get clean

