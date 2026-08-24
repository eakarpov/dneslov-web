import {fetchLegacyJson} from "../../../../lib/api/host";
import {IGalleryList} from "../../../../dto/gallery";

export const getMemoryGallery = async (slug: string, from: number, to: number): Promise<IGalleryList | undefined> => {
    return fetchLegacyJson(`/${slug}/gallery.json`, {
        headers: {
            Range: `records=${from}-${to}`,
        },
        next: { revalidate: 3600 },
    });
};
