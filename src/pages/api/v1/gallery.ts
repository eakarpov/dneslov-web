import { NextApiRequest, NextApiResponse } from "next";
import { proxyLegacyJson } from "../../../lib/api/proxy";

// Legacy gallery lives at path-shaped URLs, not query params:
//   /gallery.json, /:slug/gallery.json, /:slug/:event/gallery.json
const SLUG_RE = /^[^/?#]{1,64}$/;
const EVENT_RE = /^[0-9]{1,6}$/;

const galleryPath = (slug?: string, event?: string): string | null => {
    if (!slug) return "/gallery.json";
    if (!SLUG_RE.test(slug)) return null;
    if (!event) return `/${encodeURIComponent(slug)}/gallery.json`;
    if (!EVENT_RE.test(event)) return null;
    return `/${encodeURIComponent(slug)}/${event}/gallery.json`;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        res.status(405).end();
        return;
    }

    const slug = Array.isArray(req.query.slug) ? req.query.slug[0] : req.query.slug;
    const event = Array.isArray(req.query.event) ? req.query.event[0] : req.query.event;
    const path = galleryPath(slug, event);

    if (!path) {
        res.status(400).json({ images: [], total: 0 });
        return;
    }

    await proxyLegacyJson(req, res, {
        path,
        forwardRange: true,
        fallback: { images: [], total: 0 },
    });
}
