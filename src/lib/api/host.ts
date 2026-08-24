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

// The legacy backend occasionally stalls without ever erroring (connection just hangs),
// which without an explicit timeout would hang the whole page render indefinitely.
export const fetchLegacyJson = async (path: string, init: RequestInit = {}, timeoutMs = DEFAULT_TIMEOUT_MS) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    let res: Response;

    try {
        res = await fetch(buildLegacyApiUrl(path), { ...init, signal: controller.signal });
    } catch (e) {
        throw new LegacyUnavailableError(path);
    } finally {
        clearTimeout(timeoutId);
    }

    // A real 404 from Rails is an answer: the record does not exist.
    if (res.status === 404) return null;
    if (!res.ok) throw new LegacyUnavailableError(path, res.status);

    return res.json();
};
