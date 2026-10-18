FROM node:24-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .

ENV NODE_ENV=production

RUN npm run build

# Final image — only the built artefacts
FROM node:24-alpine AS dist

# Nothing installs at runtime, and project overrides do not patch the
# dependencies bundled with global npm/corepack/yarn, so remove them.
RUN apk upgrade --no-cache \
    && rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack /opt/yarn* \
    && rm -f /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack /usr/local/bin/yarn /usr/local/bin/yarnpkg

WORKDIR /dist
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
