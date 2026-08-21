import {fetchLegacyJson} from "../../../lib/api/host";
import {IGalleryImageDetail} from "../../../dto/gallery";

export const getGalleryImage = async (uid: string): Promise<IGalleryImageDetail | undefined> => {
    return fetchLegacyJson(`/gallery/${uid}.json`)
        .catch(e => console.log(e));
};
