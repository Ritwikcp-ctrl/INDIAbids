import { env } from "../config/env.js";
import { logger } from "./logger.js";
/**
 * Lightweight zero-dependency error reporting hook.
 * When SENTRY_DSN is configured, dispatches unhandled 500 errors to Sentry's store API.
 */
export function reportServerError(error, context) {
    if (!env.SENTRY_DSN)
        return;
    try {
        const parsed = new URL(env.SENTRY_DSN);
        const projectId = parsed.pathname.replace(/^\//, "");
        const publicKey = parsed.username;
        if (!projectId || !publicKey)
            return;
        const storeUrl = `${parsed.protocol}//${parsed.host}/api/${projectId}/store/`;
        const errObj = error instanceof Error
            ? { type: error.name, value: error.message }
            : { type: "UnknownError", value: String(error) };
        void fetch(storeUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Sentry-Auth": `Sentry sentry_version=7, sentry_key=${publicKey}, sentry_client=indiabids-api/1.0`,
            },
            body: JSON.stringify({
                platform: "node",
                environment: env.NODE_ENV,
                level: "error",
                exception: { values: [errObj] },
                tags: {
                    method: context.method,
                    path: context.path,
                    requestId: context.requestId ?? "unknown",
                },
            }),
        }).catch((dispatchErr) => {
            logger.warn({ dispatchErr }, "Failed to ship error event to Sentry");
        });
    }
    catch {
        // Ignore malformed SENTRY_DSN at runtime
    }
}
