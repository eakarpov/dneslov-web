import {NextApiRequest, NextApiResponse} from "next";
import axios, {AxiosRequestConfig} from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        console.log(Object.keys(req.query)[0]);
        return axios.get(`http://${process.env.BASE_API_HOST}/api/v1/calendaries.json?${Object.keys(req.query)[0]}`, {
        } as AxiosRequestConfig).then((resp) => {
            res.status(200).json(resp.data);
            return;
        }).catch((e) => {
            res.status(200);
        });
    }
}