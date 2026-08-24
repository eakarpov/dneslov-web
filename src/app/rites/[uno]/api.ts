import {fetchLegacyJson} from "../../../lib/api/host";
import {IRite} from "../../../dto/rite";

export const getRite = async (uno: string): Promise<IRite | undefined> => {
    return fetchLegacyJson(`/rites/${uno}.json`)
        .catch((e) => {
        console.error(e);
        return undefined;
    });
};
