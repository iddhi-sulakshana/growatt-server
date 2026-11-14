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
# winston writes ./logs/*.log relative to the working directory.
RUN mkdir -p logs && chown -R bun:bun /app
USER bun

EXPOSE 3000
CMD ["bun", "run", "src/index.ts"]
