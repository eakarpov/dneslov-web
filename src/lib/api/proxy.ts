import type { NextApiRequest, NextApiResponse } from "next";
import { fetchLegacyAnswer } from "./host";

// Only named params are forwarded: the browser must not be able to steer this
// proxy at the legacy backend with arbitrary query strings.
export const pickParams = (req: NextApiRequest, allowed: readonly string[]): URLSearchParams => {
    const params = new URLSearchParams();

    for (const key of allowed) {
        const raw = req.query[key];
        const value = Array.isArray(raw) ? raw[0] : raw;
        if (typeof value === "string" && value !== "") {
            params.set(key, value);
        }
    }

    return params;
};

interface ProxyOptions {
    path: string;
    params?: URLSearchParams;
    forwardRange?: boolean;
    fallback: unknown;
    // Applied to the backend payload before it reaches the browser, so the
    // client sees the same shape the server-rendered pass produced.
    transform?: (data: any) => unknown;
}

export const proxyLegacyJson = async (
    req: NextApiRequest,
    res: NextApiResponse,
    { path, params, forwardRange = false, fallback, transform }: ProxyOptions,
) => {
    const search = params?.toString();
    const url = search ? `${path}?${search}` : path;

    const init: RequestInit =
        forwardRange && req.headers.range ? { headers: { Range: req.headers.range } } : {};

    try {
        // Goes through the same layer as the server-rendered pass, so the
        // browser gets the last known good copy on an outage too.
        const { data, stale } = await fetchLegacyAnswer(url, init);

        if (stale) res.setHeader("X-Dneslov-Stale", "true");
        res.status(200).json(transform ? transform(data) : data);
    } catch {
        // Nothing live and nothing saved.
        res.status(502).json(fallback);
    }
};
