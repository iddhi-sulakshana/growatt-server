/*
 * Growatt Server service worker — offline app shell for the installed PWA.
 *
 * This dashboard reports live inverter, battery and grid state, so nothing that
 * describes the plant may ever be served from a cache: every cross-origin
 * request (the API host, Google Fonts) and every non-GET request goes straight
 * to the network and is not intercepted at all.
 *
 * What is cached is the shell — index.html plus Vite's content-hashed bundles —
 * so launching from the home screen without connectivity boots the UI (which
 * then shows its own "failed to load" state) instead of the browser's error
 * page. Hashed filenames make the asset cache safe: a new build requests new
 * URLs, and the old cache version is dropped on activate.
 */

const VERSION = "v1";
const SHELL_CACHE = `growatt-shell-${VERSION}`;
const ASSET_CACHE = `growatt-assets-${VERSION}`;
const CURRENT_CACHES = [SHELL_CACHE, ASSET_CACHE];

// react-router serves every route from index.html, so one entry is the shell
// for all navigations.
const SHELL_URL = "/index.html";

const PRECACHE_URLS = [
    SHELL_URL,
    "/manifest.webmanifest",
    "/icon.png",
    "/logo.png",
    "/icons/icon-192.png",
    "/icons/icon-512.png",
];

const ASSET_PATTERN = /\.(?:js|mjs|css|woff2?|ttf|otf|png|jpe?g|svg|webp|avif|ico)$/i;

self.addEventListener("install", (event) => {
    event.waitUntil(
        (async () => {
            const cache = await caches.open(SHELL_CACHE);
            // allSettled, not addAll: one missing optional asset must not abort
            // the whole install and leave the app without a worker.
            await Promise.allSettled(
                PRECACHE_URLS.map((url) =>
                    cache.add(new Request(url, { cache: "reload" }))
                )
            );
            await self.skipWaiting();
        })()
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        (async () => {
            const names = await caches.keys();
            await Promise.all(
                names
                    .filter(
                        (name) =>
                            name.startsWith("growatt-") &&
                            !CURRENT_CACHES.includes(name)
                    )
                    .map((name) => caches.delete(name))
            );
            await self.clients.claim();
        })()
    );
});

// The page posts this when the user accepts the update prompt.
self.addEventListener("message", (event) => {
    if (event.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
    const request = event.request;

    if (request.method !== "GET") return;

    const url = new URL(request.url);

    // Anything off-origin is live plant data or a third-party asset: hands off.
    if (url.origin !== self.location.origin) return;

    // Same-origin API calls (if the API is ever proxied under this host) must
    // always hit the network.
    if (url.pathname.startsWith("/api/")) return;

    if (request.mode === "navigate") {
        event.respondWith(shellFirst(request));
        return;
    }

    if (ASSET_PATTERN.test(url.pathname)) {
        event.respondWith(staleWhileRevalidate(event, request));
    }
});

/**
 * Navigations: try the network so a fresh deploy is picked up immediately, and
 * fall back to the cached shell when offline.
 */
async function shellFirst(request) {
    const cache = await caches.open(SHELL_CACHE);
    try {
        const response = await fetch(request);
        // A redirected response cannot be written to the cache, and a non-2xx
        // one would poison the shell.
        if (response.ok && !response.redirected) {
            cache.put(SHELL_URL, response.clone());
        }
        return response;
    } catch {
        const cached = await cache.match(SHELL_URL);
        if (cached) return cached;
        throw new Error("offline and no cached shell available");
    }
}

/**
 * Assets: serve from cache instantly when present, refresh in the background.
 * `waitUntil` keeps the worker alive long enough for that refresh to land.
 */
async function staleWhileRevalidate(event, request) {
    const cache = await caches.open(ASSET_CACHE);
    const cached = await cache.match(request);

    const revalidate = fetch(request)
        .then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
        })
        .catch(() => undefined);

    if (cached) {
        event.waitUntil(revalidate);
        return cached;
    }

    const response = await revalidate;
    if (response) return response;
    throw new Error(`offline and ${request.url} is not cached`);
}
