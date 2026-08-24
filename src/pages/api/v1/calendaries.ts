import { NextApiRequest, NextApiResponse } from "next";
import { pickParams, proxyLegacyJson } from "../../../lib/api/proxy";

const ALLOWED = ["page", "per", "c", "l"] as const;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        res.status(405).end();
        return;
    }

    await proxyLegacyJson(req, res, {
        path: "/calendaries.json",
        params: pickParams(req, ALLOWED),
        fallback: { list: [], total: 0 },
    });
}
