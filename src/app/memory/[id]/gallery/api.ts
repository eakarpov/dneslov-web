import {fetchLegacyJson} from "../../../../lib/api/host";
import {IGalleryList} from "../../../../dto/gallery";
import { swallowOutage } from "../../../../lib/api/load";

export const getMemoryGallery = async (slug: string, from: number, to: number): Promise<IGalleryList | undefined> => {
    return fetchLegacyJson(`/${slug}/gallery.json`, {
        headers: {
            Range: `records=${from}-${to}`,
        },
    }).catch(swallowOutage);
};
