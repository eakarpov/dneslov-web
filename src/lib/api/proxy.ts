import type { NextApiRequest, NextApiResponse } from "next";
import axios, { AxiosRequestConfig } from "axios";
import { buildLegacyApiUrl } from "./host";

const TIMEOUT_MS = 10000;

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
    const url = buildLegacyApiUrl(search ? `${path}?${search}` : path);

    const config: AxiosRequestConfig = { timeout: TIMEOUT_MS };
    if (forwardRange && req.headers.range) {
        config.headers = { Range: req.headers.range };
    }

    try {
        const response = await axios.get(url, config);
        res.status(200).json(transform ? transform(response.data) : response.data);
    } catch {
        // The legacy backend is intermittently unreachable; answer with an empty
        // shape so the caller renders "nothing found" instead of crashing.
        res.status(502).json(fallback);
    }
};
