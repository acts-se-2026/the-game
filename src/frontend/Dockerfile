# STAGE 1: building
FROM node:20-alpine AS builder

WORKDIR /build

# Install dependencies
COPY . .

RUN npm install
RUN npm run build

# STAGE 2: runnig
FROM caddy:2-alpine

COPY --from=builder /build/dist /srv
COPY conf/Caddyfile /etc/caddy/Caddyfile

EXPOSE 80
