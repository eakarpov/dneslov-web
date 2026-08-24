// Server-only fetchers for the day view. Client code imports lib/api/day.
import { fetchLegacyJson } from "../lib/api/host";
import { normalizeDayList } from "../lib/api/normalize";
import { swallowOutage } from "../lib/api/load";
import {
    EMPTY_CALENDARIES,
    ICalendaryList,
    IDayFilters,
    dayFiltersToParams,
} from "../lib/api/day";
import { IDayMemoList } from "../dto/day";

export type { IDayFilters, ICalendaryList };

// Cached for an hour so a flaky dneslov.org can't stall every render.
// Returns null when the backend could not be reached — "nothing on this day"
// and "the reference is down" must not look the same to the reader, and the
// failed render must not be cached (swallowOutage marks it no-store).
export const getDayMemories = async (filters: IDayFilters): Promise<IDayMemoList | null> =>
    fetchLegacyJson(`/index.json?${dayFiltersToParams(filters)}`, {
        next: { revalidate: 3600 },
    })
        .then(normalizeDayList)
        .catch((e) => swallowOutage(e) ?? null);

export const getCalendaries = async (page = 1, per = 100): Promise<ICalendaryList> =>
    fetchLegacyJson(`/calendaries.json?page=${page}&per=${per}&l=true`, {
        next: { revalidate: 3600 },
    }).catch((e) => swallowOutage(e) ?? EMPTY_CALENDARIES);
