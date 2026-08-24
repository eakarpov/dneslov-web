import { unstable_noStore as noStore } from "next/cache";
import { LegacyUnavailableError } from "./host";

// For the day list, where the rest of the page (calendar, calendary cloud,
// other days) stays useful even when the reference is silent: keeps the render,
// but marks it uncacheable so a transient outage is not frozen in as an answer.
//
// Content pages do the opposite on purpose — they let LegacyUnavailableError
// propagate, so the reader gets error.tsx with a retry rather than a page that
// quietly claims the record does not exist.
export const swallowOutage = (e: unknown): undefined => {
    if (!(e instanceof LegacyUnavailableError)) throw e;

    console.error(e);
    noStore();

    return undefined;
};
