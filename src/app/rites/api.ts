import {fetchLegacyJson} from "../../lib/api/host";
import {IRite} from "../../dto/rite";

export const getRites = async (): Promise<IRite[]> => {
    return fetchLegacyJson('/rites.json', { next: { revalidate: 3600 } });
};
