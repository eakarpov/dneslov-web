import { unstable_noStore as noStore } from "next/cache";
import { LegacyUnavailableError } from "./host";

export interface LegacyResult<T> {
    data: T | null;
    // The backend did not answer. The page still renders, but must not be
    // cached — otherwise one bad minute is served as the truth for an hour.
    unavailable: boolean;
}

export const loadLegacy = async <T>(load: () => Promise<T | null>): Promise<LegacyResult<T>> => {
    try {
        return { data: await load(), unavailable: false };
    } catch (e) {
        if (!(e instanceof LegacyUnavailableError)) throw e;

        console.error(e);
        noStore();

        return { data: null, unavailable: true };
    }
};

// For fetchers that only need "no data" in the UI: keeps the render, but marks
// it uncacheable so a transient outage is not frozen in as an answer.
export const swallowOutage = (e: unknown): undefined => {
    if (!(e instanceof LegacyUnavailableError)) throw e;

    console.error(e);
    noStore();

    return undefined;
};
