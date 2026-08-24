import { fetchLegacyJson, resolveApiAssetUrl } from "../../../lib/api/host";
import { IMemory } from "../../../dto/memory";

// A real 404 comes back as null and renders "not found"; an unreachable backend
// throws, so the page fails loudly (and uncached) into error.tsx with a retry,
// instead of claiming the memory does not exist.
export const getItem = async (id: string): Promise<IMemory | null> =>
    fetchLegacyJson(`/${id}.json`, { next: { revalidate: 3600 } }).then((data: IMemory | null) =>
        data ? { ...data, image_url: resolveApiAssetUrl(data.image_url) } : null,
    );
