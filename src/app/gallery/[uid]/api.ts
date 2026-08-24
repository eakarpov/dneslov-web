import {fetchLegacyJson} from "../../../lib/api/host";
import {IGalleryImageDetail} from "../../../dto/gallery";
import { swallowOutage } from "../../../lib/api/load";

export const getGalleryImage = async (uid: string): Promise<IGalleryImageDetail | undefined> => {
    return fetchLegacyJson(`/gallery/${uid}.json`)
        .catch(swallowOutage);
};
