# Stage 1: Build the application
FROM 011325603507.dkr.ecr.ap-southeast-1.amazonaws.com/node:slim AS builder

# Create app directory
WORKDIR /usr/src/app

# Copy all the required files for transpiling to js
COPY ./package.json ./yarn.lock ./tsconfig.json ./.eslintrc.json ./.eslintignore ./.prettierrc ./

# Install node dependencies - done in a separate step so Docker can cache it
RUN yarn --no-optional --frozen-lockfile

# Copy the source files over for transpiling to js
COPY ./src ./src/

RUN yarn build

# Stage 2: Build the final image
FROM 011325603507.dkr.ecr.ap-southeast-1.amazonaws.com/node:slim

RUN apt-get update && apt-get upgrade -y && apt-get install -y --no-install-recommends curl wget ca-certificates && \
    wget https://curl.se/ca/cacert.pem -O /etc/ssl/certs/ca-certificates.crt && \
    apt-get update && \
    apt-get install -y --no-install-recommends gnupg dirmngr unzip && \
    curl -sSL https://dl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | tee /etc/apt/sources.list.d/google-chrome.list && \
    apt-get update && \
    apt-get install -y --no-install-recommends google-chrome-stable tzdata openssl zip && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get clean

# Install aws cli
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && \
    ./aws/install && \
    rm awscliv2.zip

# Create app directory
WORKDIR /usr/src/app

RUN chown node:node /usr/src/app

# Switch to the node user
USER node

# Copy all the required files for transpiling to js
COPY --chown=node:node ./package.json ./yarn.lock ./

# Install node dependencies - done in a separate step so Docker can cache it
RUN yarn --production --no-optional --frozen-lockfile

COPY --chown=node:node --from=builder /usr/src/app/build ./build/

# The following is here so that changing of docker-entrypoint will be faster as the previous layers are all cached
USER root

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod 777 /usr/local/bin/docker-entrypoint.sh

USER node

CMD ["yarn", "start:prod"]