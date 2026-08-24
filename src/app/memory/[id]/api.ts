import {fetchLegacyJson, resolveApiAssetUrl} from "../../../lib/api/host";
import {IMemory} from "../../../dto/memory";

export const getItem = async (id: string): Promise<IMemory | undefined> => {
    return fetchLegacyJson(`/${id}.json`, { next: { revalidate: 3600 } })
        .then((data: IMemory) => ({ ...data, image_url: resolveApiAssetUrl(data.image_url) }))
        .catch((e) => {
        console.error(e);
        return undefined;
    });
};
