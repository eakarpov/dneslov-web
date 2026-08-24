import {fetchLegacyJson} from "../../lib/api/host";
import {IRite} from "../../dto/rite";
import { swallowOutage } from "../../lib/api/load";

export const getRites = async (): Promise<IRite[]> => {
    return fetchLegacyJson('/rites.json')
        .catch((e) => swallowOutage(e) ?? []);
};
