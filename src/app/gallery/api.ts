import {fetchLegacyJson} from "../../lib/api/host";
import {IGalleryList} from "../../dto/gallery";
import { swallowOutage } from "../../lib/api/load";

export const getGalleryIndex = async (from: number, to: number): Promise<IGalleryList | undefined> => {
    return fetchLegacyJson('/gallery.json', {
        headers: {
            Range: `records=${from}-${to}`,
        },
    }).catch(swallowOutage);
};
