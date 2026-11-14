# syntax=docker/dockerfile:1

# Debian-based bun rather than -alpine: argon2 is a native dependency, and glibc picks up
# its prebuilt binary without a compiler in the image.
FROM oven/bun:1.4.0
WORKDIR /app
ENV NODE_ENV=production

# Restore against the manifests alone so the layer caches across source-only changes.
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

COPY . .
# winston writes ./logs/*.log relative to the working directory; nothing else is written.
# Only that directory changes owner: a recursive chown of /app would copy all of
# node_modules into a new layer (about a minute on the shop server, and twice the size).
RUN mkdir -p logs && chown bun:bun logs
USER bun

EXPOSE 3000
CMD ["bun", "run", "src/index.ts"]
