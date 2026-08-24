import { fetchLegacyJson } from "../../../../../lib/api/host";
import { IGalleryList } from "../../../../../dto/gallery";
import { swallowOutage } from "../../../../../lib/api/load";

export const getEventGallery = async (
    slug: string,
    event: string,
    from: number,
    to: number,
): Promise<IGalleryList | undefined> => {
    return fetchLegacyJson(`/${slug}/${event}/gallery.json`, {
        headers: {
            Range: `records=${from}-${to}`,
        },
        next: { revalidate: 3600 },
    }).catch(swallowOutage);
};
