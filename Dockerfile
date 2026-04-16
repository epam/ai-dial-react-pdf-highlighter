FROM node:24-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .

ENV NODE_ENV=production

RUN npm run build

# Final image — only the built artefacts
FROM node:24-alpine AS dist

WORKDIR /dist
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
