import { NextApiRequest, NextApiResponse } from "next";
import { pickParams, proxyLegacyJson } from "../../../lib/api/proxy";
import { normalizeMemory } from "../../../lib/api/normalize";

const SLUG_RE = /^[^/?#]{1,64}$/;

// Same memory, fetched in the reader's own calendary context. The canonical page
// is rendered server-side in the default context and stays cacheable; this is
// the opt-in personal view layered on top of it.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        res.status(405).end();
        return;
    }

    const slug = Array.isArray(req.query.slug) ? req.query.slug[0] : req.query.slug;

    if (!slug || !SLUG_RE.test(slug)) {
        res.status(400).json(null);
        return;
    }

    await proxyLegacyJson(req, res, {
        path: `/${encodeURIComponent(slug)}.json`,
        params: pickParams(req, ["c"] as const),
        transform: normalizeMemory,
        fallback: null,
    });
}
