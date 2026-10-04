import { env } from "../../config/env";
export const REFRESH_COOKIE_NAME = env.NODE_ENV === "production"
    ? "__Host-INDIAbids_refresh"
    : "INDIAbids_refresh";
const refreshMaxAge = env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;
export function setRefreshCookie(res, token) {
    res.cookie(REFRESH_COOKIE_NAME, token, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: refreshMaxAge,
    });
}
export function clearRefreshCookie(res) {
    res.clearCookie(REFRESH_COOKIE_NAME, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
    });
}
