import { fetchLegacyJson, resolveApiAssetUrl } from "../../../lib/api/host";
import { loadLegacy, LegacyResult } from "../../../lib/api/load";
import { IMemory } from "../../../dto/memory";

export const getItem = async (id: string): Promise<LegacyResult<IMemory>> =>
    loadLegacy<IMemory>(() =>
        fetchLegacyJson(`/${id}.json`, { next: { revalidate: 3600 } }).then(
            (data: IMemory | null) =>
                data && { ...data, image_url: resolveApiAssetUrl(data.image_url) },
        ),
    );
