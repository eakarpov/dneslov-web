import {fetchLegacyJson} from "../../../lib/api/host";
import {IRite} from "../../../dto/rite";
import { swallowOutage } from "../../../lib/api/load";

export const getRite = async (uno: string): Promise<IRite | undefined> => {
    return fetchLegacyJson(`/rites/${uno}.json`)
        .catch(swallowOutage);
};
