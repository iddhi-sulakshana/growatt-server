# syntax=docker/dockerfile:1

# Debian-based bun: Tailwind v4 pulls the native @tailwindcss/oxide binary, and glibc
# sidesteps the musl variant. Only dist/ is copied forward.
FROM oven/bun:1.4.0 AS build
WORKDIR /src

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
# Same origin as the API: nginx below proxies /api/ to the backend, so the app calls a
# relative path and works under any host name or port it is opened on.
ENV VITE_API_URL=/api/v1
RUN bun run build

FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /src/dist /usr/share/nginx/html
EXPOSE 80
