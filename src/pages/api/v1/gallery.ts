import {NextApiRequest, NextApiResponse} from "next";
import axios, {AxiosRequestConfig} from "axios";
import {buildLegacyApiUrl} from "../../../lib/api/host";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const {slug, event} = req.query;
        const path = slug && event ? `/${slug}/${event}/gallery.json`
            : slug ? `/${slug}/gallery.json`
            : `/gallery.json`;

        return axios.get(buildLegacyApiUrl(path), {
            headers: {
                Range: req.headers.range,
            },
            timeout: 10000,
        } as AxiosRequestConfig).then((resp) => {
            res.status(200).json(resp.data);
            return;
        }).catch((e) => {
            res.status(200);
        });
    }
}
