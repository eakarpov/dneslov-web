import { NextApiRequest, NextApiResponse } from "next";
import { pickParams, proxyLegacyJson } from "../../../lib/api/proxy";
import { normalizeDayList } from "../../../lib/api/normalize";

const ALLOWED = ["d", "c", "q", "p"] as const;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        res.status(405).end();
        return;
    }

    await proxyLegacyJson(req, res, {
        path: "/index.json",
        params: pickParams(req, ALLOWED),
        forwardRange: true,
        transform: normalizeDayList,
        fallback: { list: [], page: 1, total: 0 },
    });
}
