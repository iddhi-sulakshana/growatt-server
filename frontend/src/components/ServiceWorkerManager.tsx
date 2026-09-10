import { useEffect } from "react";
import { toast } from "sonner";

// Always-open dashboards can sit on a stale bundle for days, so re-check for a
// new deploy periodically rather than only on load.
const UPDATE_CHECK_INTERVAL = 60 * 60 * 1000;

/**
 * Registers the PWA service worker and offers a reload when a new build is
 * waiting. Renders nothing.
 *
 * In development it instead unregisters any worker left behind by a production
 * visit on the same origin, which would otherwise serve stale bundles to `vite
 * dev` on localhost.
 */
const ServiceWorkerManager = () => {
    useEffect(() => {
        if (!("serviceWorker" in navigator)) return;

        if (!import.meta.env.PROD) {
            navigator.serviceWorker
                .getRegistrations()
                .then((registrations) =>
                    registrations.forEach((registration) =>
                        registration.unregister()
                    )
                )
                .catch(() => {
                    /* nothing to clean up */
                });
            return;
        }

        let disposed = false;
        let reloading = false;
        let interval: ReturnType<typeof setInterval> | undefined;

        // The new worker calls clients.claim() once it activates; reload then so
        // the page and its assets come from the same build.
        const onControllerChange = () => {
            if (reloading) return;
            reloading = true;
            window.location.reload();
        };
        navigator.serviceWorker.addEventListener(
            "controllerchange",
            onControllerChange
        );

        const promptUpdate = (worker: ServiceWorker) => {
            if (disposed) return;
            toast("A new version is available", {
                description: "Reload to get the latest dashboard.",
                duration: Infinity,
                action: {
                    label: "Reload",
                    onClick: () => worker.postMessage("SKIP_WAITING"),
                },
            });
        };

        navigator.serviceWorker
            .register("/sw.js")
            .then((registration) => {
                if (disposed) return;

                // Already waiting when this tab loaded (another tab is holding
                // the old worker active).
                if (registration.waiting && navigator.serviceWorker.controller) {
                    promptUpdate(registration.waiting);
                }

                registration.addEventListener("updatefound", () => {
                    const installing = registration.installing;
                    if (!installing) return;
                    installing.addEventListener("statechange", () => {
                        // No existing controller means this is the first install,
                        // not an update — nothing to prompt about.
                        if (
                            installing.state === "installed" &&
                            navigator.serviceWorker.controller
                        ) {
                            promptUpdate(installing);
                        }
                    });
                });

                interval = setInterval(() => {
                    registration.update().catch(() => {
                        /* offline; try again next tick */
                    });
                }, UPDATE_CHECK_INTERVAL);
            })
            .catch((error) => {
                // A missing or blocked worker must not break the app; it just
                // means no offline support this session.
                console.warn("Service worker registration failed:", error);
            });

        return () => {
            disposed = true;
            if (interval) clearInterval(interval);
            navigator.serviceWorker.removeEventListener(
                "controllerchange",
                onControllerChange
            );
        };
    }, []);

    return null;
};

export default ServiceWorkerManager;
