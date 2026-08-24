import { unstable_noStore as noStore } from "next/cache";
import { recallStale, rememberFresh } from "./staleStore";

const rangeOf = (init: RequestInit): string => {
    const headers = init.headers as Record<string, string> | undefined;
    return headers?.Range || headers?.range || "";
};

const cacheKey = (path: string, init: RequestInit): string => {
    const range = rangeOf(init);
    return range ? `${path}#${range}` : path;
};

// Server-only: reads BASE_API_HOST, never expose via NEXT_PUBLIC_ so it stays out of the client bundle.
export const getApiHost = () => {
    if (!process.env.BASE_API_HOST) {
        throw new Error("BASE_API_HOST is not set");
    }
    return process.env.BASE_API_HOST;
};

// BASE_API_HOST may be a bare host ("dneslov.org", defaults to https) or a full
// origin with an explicit scheme ("http://185.133.40.112") for hosts without TLS.
const getApiOrigin = () => {
    const host = getApiHost();
    return /^https?:\/\//.test(host) ? host : `https://${host}`;
};

export const buildLegacyApiUrl = (path: string) => `${getApiOrigin()}${path}`;

// Some legacy endpoints (e.g. memories#show.json's image_url) return a host-relative
// path instead of a full URL, unlike others (index.json's roundel_url is already
// absolute). Normalizes both cases so callers always get something <img src> can use.
export const resolveApiAssetUrl = (path?: string): string | undefined => {
    if (!path) return undefined;
    return /^https?:\/\//.test(path) ? path : `${getApiOrigin()}${path}`;
};

// Thrown when the backend could not be reached or answered with a server error.
// Distinct from "the backend answered, and the thing does not exist" — the two
// must never render the same, and a failure must never be cached as an answer.
export class LegacyUnavailableError extends Error {
    constructor(readonly path: string, readonly status?: number) {
        super(`legacy backend unavailable for ${path}${status ? ` (${status})` : ""}`);
        this.name = "LegacyUnavailableError";
    }
}

const DEFAULT_TIMEOUT_MS = 10000;

export interface LegacyAnswer<T = any> {
    data: T;
    // Served from the last known good copy because the backend did not answer.
    stale: boolean;
    savedAt?: number;
}

// The legacy backend occasionally stalls without ever erroring (connection just hangs),
// which without an explicit timeout would hang the whole page render indefinitely.
// Fetches and reports whether the answer is live or the last known good copy.
// A 404 is an answer in its own right (the record does not exist) and is stored
// as such, so "no longer there" does not resurrect from cache either.
export const fetchLegacyAnswer = async (
    path: string,
    init: RequestInit = {},
    timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<LegacyAnswer> => {
    // The Range header changes the body, so it has to be part of the key —
    // otherwise page 2 of a list would be served as the copy of page 1.
    const key = cacheKey(path, init);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    let res: Response | null = null;
    let failure: LegacyUnavailableError | null = null;

    try {
        res = await fetch(buildLegacyApiUrl(path), { ...init, signal: controller.signal });
    } catch {
        failure = new LegacyUnavailableError(path);
    } finally {
        clearTimeout(timeoutId);
    }

    if (res && (res.ok || res.status === 404)) {
        const data = res.status === 404 ? null : await res.json();
        await rememberFresh(key, data);

        return { data, stale: false };
    }

    const error = failure ?? new LegacyUnavailableError(path, res?.status);
    const saved = await recallStale(key);

    if (!saved) throw error;

    console.warn(`${error.message}; serving the copy saved at ${new Date(saved.savedAt).toISOString()}`);

    // A page built on a saved copy must not be frozen into the ISR cache for an
    // hour — the next visitor should get a fresh attempt. Harmless where the
    // app router isn't the caller.
    try {
        noStore();
    } catch {
        // not rendering an app-router segment
    }

    return { data: saved.value, stale: true, savedAt: saved.savedAt };
};

// The plain form, for callers that have nothing to say about staleness.
export const fetchLegacyJson = async (
    path: string,
    init: RequestInit = {},
    timeoutMs = DEFAULT_TIMEOUT_MS,
) => (await fetchLegacyAnswer(path, init, timeoutMs)).data;
