# ---- Base Node ----
FROM node:8.9-alpine AS base

RUN apk update && apk add \
  bash \
  ca-certificates \
  cyrus-sasl-dev \
  dumb-init \
  findutils \
  git \
  g++ \
  lz4-dev \
  make \
  musl-dev \
  openssh-client \
  postgresql-dev \
  python \
  && rm -rf /var/cache/apk/*

RUN apk add --no-cache --virtual .build-deps gcc zlib-dev libc-dev bsd-compat-headers py-setuptools bash

RUN adduser -D moven -h /app
USER moven
WORKDIR /app
COPY --chown=moven:moven package.json .
COPY --chown=moven:moven package-lock.json .
# ---- Dependencies ----
FROM base AS dependencies
# the following line is a build time concern for rdkafka
RUN npm set progress=false && npm config set depth 0 && npm install --only=production
COPY --chown=moven:moven . /app

# ---- Release ----
FROM dependencies AS release
ENV NODE_ENV=production
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD npm run start
