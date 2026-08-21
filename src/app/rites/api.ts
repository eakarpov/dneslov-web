import {fetchLegacyJson} from "../../lib/api/host";
import {IRite} from "../../dto/rite";

export const getRites = async (): Promise<IRite[]> => {
    return fetchLegacyJson('/rites.json')
        .catch(e => { console.log(e); return []; });
};
